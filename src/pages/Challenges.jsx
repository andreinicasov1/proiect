import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Search, Filter, Zap, CheckCircle2, Lock, ChevronRight, Globe, Cpu, ShieldCheck } from 'lucide-react'

const CATS = ['Toate','Securitate Web','Securitate Rețea','Criptografie']
const DIFFS = ['Toate','Ușor','Mediu','Greu']
const CAT_ICONS = { 'Securitate Web': Globe, 'Securitate Rețea': Cpu, 'Criptografie': Lock }
const CAT_CLS = { 'Securitate Web':'badge-web','Securitate Rețea':'badge-network','Criptografie':'badge-crypto' }
const DIFF_CLS = { 'Ușor':'badge-easy','Mediu':'badge-medium','Greu':'badge-hard' }

export default function Challenges() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [solved, setSolved] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('Toate')
  const [diff, setDiff] = useState('Toate')

  useEffect(() => {
    async function load() {
      const [{ data: ch }, { data: subs }] = await Promise.all([
        supabase.from('challenges').select('*').order('created_at', { ascending:true }),
        supabase.from('submissions').select('challenge_id').eq('user_id', user.id).eq('is_correct', true)
      ])
      setChallenges(ch || [])
      setSolved(new Set((subs||[]).map(s=>s.challenge_id)))
      setLoading(false)
    }
    load()
  }, [user])

  const filtered = challenges.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
    const matchCat  = cat === 'Toate' || c.category === cat
    const matchDiff = diff === 'Toate' || c.difficulty === diff
    return matchSearch && matchCat && matchDiff
  })

  const totalSolved = solved.size

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-mono font-bold text-2xl text-white mb-1">Exerciții <span className="terminal-cursor"/></h1>
        <p className="font-mono text-gray-500 text-sm">{totalSolved}/{challenges.length} exerciții rezolvate</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-3 animate-fade-in stagger-1">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"/>
          <input className="input-field pl-9 text-sm" placeholder="Caută exerciții..." value={search}
            onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="input-field text-sm w-full sm:w-44" value={cat} onChange={e=>setCat(e.target.value)}>
          {CATS.map(c=><option key={c}>{c}</option>)}
        </select>
        <select className="input-field text-sm w-full sm:w-32" value={diff} onChange={e=>setDiff(e.target.value)}>
          {DIFFS.map(d=><option key={d}>{d}</option>)}
        </select>
      </div>

      {/* Category Progress */}
      <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in stagger-2">
        {['Securitate Web','Securitate Rețea','Criptografie'].map(c => {
          const total = challenges.filter(ch=>ch.category===c).length
          const done  = challenges.filter(ch=>ch.category===c && solved.has(ch.id)).length
          const Icon  = CAT_ICONS[c]
          const pct   = total ? (done/total)*100 : 0
          return (
            <div key={c} className="glass-card p-4 cursor-pointer hover:-translate-y-0.5 transition-all" onClick={()=>setCat(cat===c?'Toate':c)}>
              <Icon size={16} className={`mb-2 ${c==='Securitate Web'?'text-blue-400':c==='Securitate Rețea'?'text-purple-400':'text-orange-400'}`}/>
              <div className="font-mono text-xs text-gray-400 mb-2 leading-tight">{c}</div>
              <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-gradient-to-r from-neon-green to-neon-cyan rounded-full" style={{width:`${pct}%`}}/>
              </div>
              <div className="font-mono text-[10px] text-gray-600">{done}/{total}</div>
            </div>
          )
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">{[1,2,3,4].map(i=><div key={i} className="glass-card h-20 animate-pulse bg-dark-800/40"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card py-16 text-center">
          <Filter size={28} className="text-gray-700 mx-auto mb-2"/>
          <p className="font-mono text-gray-500 text-sm">Niciun exercițiu găsit.</p>
          <button onClick={()=>{setSearch('');setCat('Toate');setDiff('Toate')}}
            className="font-mono text-xs text-neon-green hover:underline mt-2">Resetează filtrele</button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((c, i) => {
            const isSolved = solved.has(c.id)
            return (
              <Link key={c.id} to={`/exercitii/${c.id}`}
                className="glass-card p-5 flex items-center gap-4 group transition-all duration-200 hover:-translate-y-0.5 hover:border-neon-green/25 animate-fade-in"
                style={{animationDelay:`${i*0.04}s`}}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors
                  ${isSolved?'bg-green-900/40 border border-green-700/30':'bg-dark-700 border border-dark-300/30 group-hover:border-neon-green/30'}`}>
                  {isSolved ? <CheckCircle2 size={18} className="text-green-400"/> : <ShieldCheck size={18} className="text-gray-600 group-hover:text-neon-green transition-colors"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-mono text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{c.title}</span>
                    {isSolved && <span className="badge bg-green-900/30 text-green-400 border-green-700/30 text-[10px]">✓ Rezolvat</span>}
                    {c.is_daily && <span className="badge bg-yellow-900/30 text-yellow-400 border-yellow-700/30 text-[10px]">⚡ Zilnic</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge ${CAT_CLS[c.category]||'badge-web'} text-[10px]`}>{c.category}</span>
                    <span className={`badge ${DIFF_CLS[c.difficulty]||'badge-easy'} text-[10px]`}>{c.difficulty}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Zap size={13} className="text-neon-green"/>
                  <span className="font-mono text-sm font-bold text-neon-green">{c.xp_reward}</span>
                  <ChevronRight size={14} className="text-gray-700 group-hover:text-neon-green ml-1 transition-colors"/>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
