import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { notify } from '../components/Notification'
import { Trophy, Clock, Zap, Users, Plus, X, Save, ChevronRight, Swords, Calendar } from 'lucide-react'

function CountDown({ endsAt }) {
  const [left, setLeft] = useState('')
  useEffect(() => {
    function calc() {
      const diff = new Date(endsAt) - Date.now()
      if (diff <= 0) { setLeft('Terminat'); return }
      const h = Math.floor(diff/3600000)
      const m = Math.floor((diff%3600000)/60000)
      const s = Math.floor((diff%60000)/1000)
      setLeft(`${h}h ${m}m ${s}s`)
    }
    calc(); const t = setInterval(calc, 1000); return () => clearInterval(t)
  }, [endsAt])
  return <span className="tabular-nums">{left}</span>
}

const STATUS_CLS = {
  'activ':     'bg-green-900/30 text-green-400 border-green-700/30',
  'în curând': 'bg-yellow-900/30 text-yellow-400 border-yellow-700/30',
  'terminat':  'bg-dark-700 text-gray-500 border-dark-300',
}

export default function ClanTournaments() {
  const { isAdmin, user } = useAuth()
  const [tournaments, setTournaments] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [myClan, setMyClan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name:'', description:'', starts_at:'', ends_at:'', xp_reward:500 })

  useEffect(() => { loadAll() }, [user])

  async function loadAll() {
    setLoading(true)
    const [{ data: tours }, { data: regs }, { data: mc }] = await Promise.all([
      supabase.from('tournaments').select('*, tournament_registrations(clan_id, clans(name,tag,xp))').order('starts_at', { ascending: false }),
      supabase.from('tournament_registrations').select('tournament_id, clan_id').eq('user_id', user.id),
      supabase.from('clan_members').select('clan_id, clans(id,name,tag,xp)').eq('user_id', user.id).maybeSingle()
    ])
    setTournaments(tours || [])
    setRegistrations(regs || [])
    setMyClan(mc?.clans || null)
    setLoading(false)
  }

  async function createTournament(e) {
    e.preventDefault()
    try {
      const { error } = await supabase.from('tournaments').insert({ ...form, xp_reward: Number(form.xp_reward) })
      if (error) throw error
      notify('Turneu creat!', 'success'); setModal(false); loadAll()
    } catch(err) { notify(err.message, 'error') }
  }

  async function registerClan(tournamentId) {
    if (!myClan) return notify('Trebuie să fii într-un clan!', 'error')
    try {
      const { error } = await supabase.from('tournament_registrations').insert({
        tournament_id: tournamentId, clan_id: myClan.id, user_id: user.id
      })
      if (error) throw error
      notify('Clan înregistrat! 🎉', 'success'); loadAll()
    } catch { notify('Clanul este deja înregistrat!', 'error') }
  }

  async function deleteTournament(id) {
    if (!confirm('Ștergi turneul?')) return
    await supabase.from('tournaments').delete().eq('id', id)
    notify('Șters.', 'info'); loadAll()
  }

  function getStatus(t) {
    const now = Date.now()
    const start = new Date(t.starts_at)
    const end = new Date(t.ends_at)
    if (now < start) return 'în curând'
    if (now > end) return 'terminat'
    return 'activ'
  }

  const inp = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) })

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-mono font-bold text-2xl text-white mb-1 flex items-center gap-3">
            <Swords size={22} className="text-yellow-400"/> Turnee Clanuri <span className="terminal-cursor"/>
          </h1>
          <p className="font-mono text-gray-500 text-sm">Concurează cu clanul tău pentru XP bonus.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setModal(true)} className="neon-btn-solid text-sm px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={14}/> Creează Turneu
          </button>
        )}
      </div>

      {!myClan && (
        <div className="glass-card p-4 mb-6 border-yellow-700/30 bg-yellow-900/5 flex items-center gap-3">
          <Users size={16} className="text-yellow-400 shrink-0"/>
          <p className="font-mono text-sm text-yellow-400">Trebuie să fii într-un clan pentru a participa la turnee.
            <a href="/clanuri" className="underline ml-1 hover:text-yellow-300">Alătură-te unui clan →</a>
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4">{[1,2,3].map(i=><div key={i} className="glass-card h-32 animate-pulse bg-dark-800/40"/>)}</div>
      ) : tournaments.length === 0 ? (
        <div className="glass-card py-16 text-center">
          <Trophy size={28} className="text-gray-700 mx-auto mb-2"/>
          <p className="font-mono text-gray-500 text-sm">Niciun turneu disponibil.</p>
          {isAdmin && <button onClick={()=>setModal(true)} className="neon-btn-solid text-sm px-5 py-2 rounded-lg mt-4">Creează primul turneu</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {tournaments.map((t, i) => {
            const status = getStatus(t)
            const regs = t.tournament_registrations || []
            const isRegistered = myClan && regs.some(r => r.clan_id === myClan.id)
            const sortedClans = [...regs].sort((a,b) => (b.clans?.xp||0) - (a.clans?.xp||0))

            return (
              <div key={t.id} className={`glass-card p-6 flex flex-col gap-4 transition-all animate-fade-in
                ${status==='activ'?'border-green-700/25':''}`}
                style={{ animationDelay:`${i*0.07}s` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={`badge text-xs ${STATUS_CLS[status]}`}>{status.toUpperCase()}</span>
                      {isRegistered && <span className="badge bg-neon-green/10 text-neon-green border-neon-green/25 text-xs">✓ Înscris</span>}
                    </div>
                    <h3 className="font-mono font-bold text-gray-100 text-base mb-1">{t.name}</h3>
                    <p className="font-mono text-xs text-gray-500 leading-relaxed">{t.description}</p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => deleteTournament(t.id)} className="text-gray-600 hover:text-red-400 transition-colors shrink-0 p-1">
                      <X size={14}/>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 font-mono text-xs text-gray-500">
                    <Calendar size={11} className="text-gray-600"/>
                    {new Date(t.starts_at).toLocaleDateString('ro-RO')} — {new Date(t.ends_at).toLocaleDateString('ro-RO')}
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-neon-green ml-auto">
                    <Zap size={11}/>{t.xp_reward} XP bonus
                  </div>
                </div>

                {status === 'activ' && (
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <Clock size={11} className="text-red-400 animate-pulse"/>
                    <span className="text-red-400">Timp rămas: </span>
                    <span className="text-red-300 font-bold"><CountDown endsAt={t.ends_at}/></span>
                  </div>
                )}

                {/* Leaderboard mini */}
                {regs.length > 0 && (
                  <div>
                    <p className="font-mono text-xs text-gray-600 mb-2 uppercase tracking-wider">Clanuri înscrise ({regs.length})</p>
                    <div className="flex flex-col gap-1.5">
                      {sortedClans.slice(0,5).map((r,idx) => (
                        <div key={r.clan_id} className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-600 w-4">{idx+1}</span>
                          <span className="font-mono text-xs font-bold text-gray-500 w-14">[{r.clans?.tag}]</span>
                          <span className="font-mono text-xs text-gray-300 flex-1 truncate">{r.clans?.name}</span>
                          <span className="font-mono text-xs text-neon-green tabular-nums">{r.clans?.xp||0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {myClan && !isRegistered && status !== 'terminat' && (
                  <button onClick={() => registerClan(t.id)}
                    className="neon-btn-solid w-full py-2.5 text-sm flex items-center justify-center gap-2">
                    <Trophy size={14}/> Înscrie [{myClan.tag}]
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(false)}/>
          <div className="relative glass-card w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-mono font-bold text-lg text-neon-green">Turneu Nou</h3>
              <button onClick={() => setModal(false)} className="text-gray-500 hover:text-gray-300"><X size={18}/></button>
            </div>
            <form onSubmit={createTournament} className="flex flex-col gap-4">
              <div>
                <label className="font-mono text-xs text-gray-400 mb-1.5 block">NUME TURNEU *</label>
                <input type="text" required className="input-field text-sm" placeholder="Ex: Hack the Planet Cup" {...inp('name')}/>
              </div>
              <div>
                <label className="font-mono text-xs text-gray-400 mb-1.5 block">DESCRIERE</label>
                <textarea rows={2} className="input-field text-sm resize-none" placeholder="Regulile turneului..." {...inp('description')}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-xs text-gray-400 mb-1.5 block">START *</label>
                  <input type="datetime-local" required className="input-field text-sm" {...inp('starts_at')}/>
                </div>
                <div>
                  <label className="font-mono text-xs text-gray-400 mb-1.5 block">FINAL *</label>
                  <input type="datetime-local" required className="input-field text-sm" {...inp('ends_at')}/>
                </div>
              </div>
              <div>
                <label className="font-mono text-xs text-gray-400 mb-1.5 block">XP BONUS CÂȘTIGĂTOR</label>
                <input type="number" min="100" className="input-field text-sm" {...inp('xp_reward')}/>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="neon-btn-solid flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                  <Save size={14}/> Creează
                </button>
                <button type="button" onClick={() => setModal(false)} className="neon-btn flex-1 py-2.5 text-sm">Anulează</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
