import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { notify } from '../components/Notification'
import { Trophy, Clock, Zap, Send, ChevronRight, Flag, Lock } from 'lucide-react'

const DIFF_CLS = { 'Ușor':'badge-easy','Mediu':'badge-medium','Greu':'badge-hard' }
const CAT_CLS  = { 'Securitate Web':'badge-web','Securitate Rețea':'badge-network','Criptografie':'badge-crypto' }

export default function CTFMode() {
  const { user, refreshProfile } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [solved, setSolved] = useState(new Set())
  const [selected, setSelected] = useState(null)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [started, setStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [logs, setLogs] = useState(['> CTF Mode — Rezolvă cât mai multe exerciții în 10 minute!', '> Selectează un exercițiu pentru a începe.'])
  const timerRef = useRef(null)
  const DURATION = 600 // 10 min

  useEffect(() => {
    async function load() {
      const [{ data: ch }, { data: subs }] = await Promise.all([
        supabase.from('challenges').select('id,title,category,difficulty,xp_reward,description,correct_answer,hint').limit(20),
        supabase.from('submissions').select('challenge_id').eq('user_id', user.id).eq('is_correct', true)
      ])
      setChallenges(ch||[])
      const s = new Set((subs||[]).map(x=>x.challenge_id))
      setSolved(s)
      setScore([...(ch||[])].filter(c=>s.has(c.id)).reduce((a,c)=>a+c.xp_reward,0))
    }
    load()
    return () => clearInterval(timerRef.current)
  }, [user])

  function startCTF() {
    setStarted(true); setElapsed(0)
    setLogs(prev=>[...prev,'> ⚡ CTF pornit! Timp: 10:00'])
    timerRef.current = setInterval(() => {
      setElapsed(e => {
        if (e+1 >= DURATION) { clearInterval(timerRef.current); setStarted(false); notify('Timp expirat!','warning'); return DURATION }
        return e+1
      })
    }, 1000)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!answer.trim() || submitting || !selected || solved.has(selected.id)) return
    setSubmitting(true)
    setLogs(prev=>[...prev,`> $ ${answer}`])
    const isCorrect = answer.trim().toLowerCase() === selected.correct_answer.trim().toLowerCase()
    if (isCorrect) {
      const { data, error } = await supabase.rpc('submit_answer', {
        p_user_id: user.id, p_challenge_id: selected.id, p_xp_reward: selected.xp_reward
      })
      if (!error && data?.xp_added > 0) {
        setSolved(prev => new Set([...prev, selected.id]))
        setScore(s => s + selected.xp_reward)
        setLogs(prev=>[...prev,`> ✓ CORECT! +${selected.xp_reward} XP | Score total: ${score+selected.xp_reward}`])
        notify(`+${selected.xp_reward} XP!`, 'success')
        await refreshProfile()
      } else {
        setLogs(prev=>[...prev,'> ✓ Corect! (XP deja acordat)'])
        setSolved(prev => new Set([...prev, selected.id]))
      }
    } else {
      setLogs(prev=>[...prev,'> ✗ Greșit. Încearcă alt exercițiu.'])
      notify('Greșit!','error')
    }
    setAnswer(''); setSubmitting(false)
  }

  function fmt(s) { return `${String(Math.floor((DURATION-s)/60)).padStart(2,'0')}:${String((DURATION-s)%60).padStart(2,'0')}` }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="font-mono font-bold text-2xl text-white mb-1 flex items-center gap-3">
          <Trophy size={22} className="text-yellow-400"/>CTF Mode <span className="terminal-cursor"/>
        </h1>
        <p className="font-mono text-gray-500 text-sm">Rezolvă cât mai multe exerciții în 10 minute.</p>
      </div>

      {/* Top bar */}
      <div className="glass-card p-4 mb-5 flex flex-wrap items-center gap-4 animate-fade-in stagger-1">
        <div className="flex items-center gap-2">
          <Clock size={16} className={elapsed>0&&elapsed>=DURATION-60?'text-red-400 animate-pulse':'text-neon-cyan'}/>
          <span className={`font-mono font-bold text-lg tabular-nums ${elapsed>=DURATION-60?'text-red-400':'text-neon-cyan'}`}>
            {fmt(elapsed)}
          </span>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Zap size={14} className="text-neon-green"/>
          <span className="font-mono font-bold text-neon-green text-lg tabular-nums">{score} XP</span>
        </div>
        <div className="flex items-center gap-2">
          <Flag size={14} className="text-yellow-400"/>
          <span className="font-mono text-sm text-gray-400">{solved.size} rezolvate</span>
        </div>
        {!started ? (
          <button onClick={startCTF} className="ml-auto neon-btn-solid px-6 py-2 rounded-lg text-sm flex items-center gap-2">
            <Clock size={14}/> {elapsed===0?'Start CTF':'Restart'}
          </button>
        ) : (
          <span className="ml-auto badge bg-green-900/30 text-green-400 border-green-700/30 animate-pulse">🔴 Live</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Challenges list */}
        <div className="glass-card overflow-hidden animate-fade-in stagger-2">
          <div className="px-4 py-3 border-b border-dark-300/25 font-mono text-xs text-gray-600 uppercase tracking-wider">Exerciții</div>
          <div className="overflow-y-auto max-h-[420px]">
            {challenges.map(c => {
              const isSolved = solved.has(c.id)
              return (
                <div key={c.id} onClick={()=>{ if(started||isSolved) setSelected(c) }}
                  className={`px-4 py-3 border-b border-dark-300/10 flex items-center gap-3 transition-colors
                    ${selected?.id===c.id?'bg-neon-green/5 border-l-2 border-l-neon-green':''}
                    ${(started||isSolved)?'cursor-pointer hover:bg-dark-800/40':'opacity-50 cursor-not-allowed'}`}>
                  <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 text-xs
                    ${isSolved?'bg-green-900/40 border border-green-700/30 text-green-400':'bg-dark-700 border border-dark-300/30 text-gray-600'}`}>
                    {isSolved?'✓':'?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs text-gray-300 truncate">{c.title}</div>
                    <div className="flex gap-1.5 mt-0.5">
                      <span className={`badge ${DIFF_CLS[c.difficulty]} text-[9px]`}>{c.difficulty}</span>
                      <span className={`badge ${CAT_CLS[c.category]} text-[9px]`}>{c.category}</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-neon-green shrink-0">+{c.xp_reward}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Active challenge */}
        <div className="flex flex-col gap-4 animate-fade-in stagger-3">
          {selected ? (
            <>
              <div className="glass-card p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-mono font-bold text-gray-200 text-sm">{selected.title}</h3>
                  {solved.has(selected.id) && <span className="badge bg-green-900/30 text-green-400 border-green-700/30 shrink-0">✓ Rezolvat</span>}
                </div>
                <p className="font-mono text-gray-400 text-xs leading-relaxed mb-3">{selected.description}</p>
                <div className="flex gap-2 flex-wrap">
                  <span className={`badge ${DIFF_CLS[selected.difficulty]}`}>{selected.difficulty}</span>
                  <span className={`badge ${CAT_CLS[selected.category]}`}>{selected.category}</span>
                  <span className="badge bg-neon-green/10 text-neon-green border-neon-green/25 ml-auto">+{selected.xp_reward} XP</span>
                </div>
              </div>
              <div className="glass-card overflow-hidden">
                <div className="bg-dark-800 px-3 py-2 border-b border-dark-300/25 font-mono text-xs text-neon-green flex items-center gap-2">
                  <span>$</span> Terminal
                </div>
                <div className="p-3 font-mono text-xs space-y-1 max-h-32 overflow-y-auto" style={{background:'rgba(2,4,8,0.95)'}}>
                  {logs.slice(-6).map((l,i)=>(
                    <div key={i} className={l.startsWith('> ✓')?'text-neon-green':l.startsWith('> ✗')?'text-red-400':l.startsWith('> $')?'text-neon-cyan':'text-gray-600'}>{l}</div>
                  ))}
                </div>
                <form onSubmit={handleSubmit} className="flex gap-0 border-t border-dark-300/25">
                  <span className="font-mono text-neon-green px-3 flex items-center text-sm">$</span>
                  <input value={answer} onChange={e=>setAnswer(e.target.value)}
                    disabled={!started||solved.has(selected.id)||submitting}
                    placeholder={!started?'Pornește CTF mai întâi...':solved.has(selected.id)?'Rezolvat!':'Răspuns...'}
                    className="flex-1 bg-transparent font-mono text-xs text-gray-200 py-3 outline-none placeholder-gray-700 disabled:opacity-40"/>
                  <button type="submit" disabled={!started||solved.has(selected.id)||submitting||!answer.trim()}
                    className="px-3 text-neon-green font-mono text-sm disabled:opacity-30"><Send size={13}/></button>
                </form>
              </div>
            </>
          ) : (
            <div className="glass-card p-8 text-center flex-1 flex flex-col items-center justify-center">
              <Lock size={28} className="text-gray-700 mb-3"/>
              <p className="font-mono text-gray-500 text-sm mb-1">{started?'Selectează un exercițiu':'Pornește CTF-ul pentru a selecta'}</p>
              {!started && <button onClick={startCTF} className="neon-btn-solid px-5 py-2 rounded-lg text-sm mt-4 flex items-center gap-2"><Clock size={14}/>Start CTF</button>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
