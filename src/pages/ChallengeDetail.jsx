import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { notify } from '../components/Notification'
import { ArrowLeft, Zap, Clock, Lightbulb, Send, CheckCircle2, Lock, Terminal } from 'lucide-react'

const DIFF_CLS = { 'Ușor':'badge-easy','Mediu':'badge-medium','Greu':'badge-hard' }
const CAT_CLS  = { 'Securitate Web':'badge-web','Securitate Rețea':'badge-network','Criptografie':'badge-crypto' }

function Confetti() {
  const colors = ['#00ff88','#00e5ff','#ffcc00','#ff3366','#bf5fff']
  return (
    <div className="confetti-container">
      {Array.from({length:40}).map((_,i) => (
        <div key={i} style={{
          position:'absolute', left:`${Math.random()*100}%`, top:'-10px',
          width:`${4+Math.random()*6}px`, height:`${4+Math.random()*6}px`,
          background: colors[Math.floor(Math.random()*colors.length)],
          borderRadius: Math.random()>0.5?'50%':'2px',
          animation:`fall ${1.5+Math.random()*2}s linear ${Math.random()*0.5}s forwards`,
        }}/>
      ))}
      <style>{`@keyframes fall{to{top:110vh;transform:rotate(${360+Math.floor(Math.random()*360)}deg)}}`}</style>
    </div>
  )
}

export default function ChallengeDetail() {
  const { id } = useParams()
  const { user, refreshProfile } = useAuth()
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [solved, setSolved] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [lines, setLines] = useState([])
  const [elapsed, setElapsed] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const termRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    async function load() {
      const [{ data: ch }, { data: sub }] = await Promise.all([
        supabase.from('challenges').select('*').eq('id', id).single(),
        supabase.from('submissions').select('id').eq('user_id', user.id).eq('challenge_id', id).eq('is_correct', true).maybeSingle()
      ])
      setChallenge(ch)
      if (sub) { setSolved(true); setResult('correct') }
      setLines([
        `> CyberForge Terminal v2.0`,
        `> Exercițiu încărcat: ${ch?.title}`,
        `> Categorie: ${ch?.category} | Dificultate: ${ch?.difficulty}`,
        sub ? '> [REZOLVAT] Ai mai rezolvat acest exercițiu.' : '> Introdu răspunsul și apasă Enter...',
      ])
      setLoading(false)
    }
    load()
  }, [id, user])

  useEffect(() => {
    if (!solved) { timerRef.current = setInterval(() => setElapsed(e => e+1), 1000) }
    return () => clearInterval(timerRef.current)
  }, [solved])

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
  }, [lines])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!answer.trim() || submitting || solved) return
    setSubmitting(true)
    setLines(prev => [...prev, `> $ ${answer}`])
    const isCorrect = answer.trim().toLowerCase() === challenge.correct_answer.trim().toLowerCase()
    if (isCorrect) {
      const { data, error } = await supabase.rpc('submit_answer', {
        p_user_id: user.id, p_challenge_id: id, p_xp_reward: challenge.xp_reward
      })
      if (error) {
        notify('Eroare: ' + error.message, 'error')
        setLines(prev => [...prev, `> EROARE: ${error.message}`])
      } else {
        clearInterval(timerRef.current)
        setSolved(true); setResult('correct')
        const xpAdded = data?.xp_added || 0
        setLines(prev => [...prev,
          `> ✓ RĂSPUNS CORECT!`,
          xpAdded > 0 ? `> +${xpAdded} XP acordat! Timp: ${formatTime(elapsed)}` : `> XP deja acordat anterior.`,
          `> Felicitări, hacker! 🎉`
        ])
        if (xpAdded > 0) {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
          notify(`+${xpAdded} XP câștigat! Exercițiu rezolvat!`, 'success')
        } else {
          notify('Răspuns corect!', 'success')
        }
        await refreshProfile()
      }
    } else {
      setResult('wrong')
      setLines(prev => [...prev, '> ✗ Răspuns incorect. Mai încearcă!'])
      notify('Răspuns greșit!', 'error')
      setTimeout(() => setResult(null), 2000)
    }
    setAnswer('')
    setSubmitting(false)
  }

  function formatTime(s) { return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}` }

  if (loading) return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      {[1,2,3].map(i=><div key={i} className="glass-card h-24 animate-pulse bg-dark-800/40"/>)}
    </div>
  )
  if (!challenge) return (
    <div className="text-center py-16">
      <p className="font-mono text-gray-500">Exercițiu negăsit.</p>
      <Link to="/exercitii" className="font-mono text-neon-green hover:underline mt-2 inline-block">← Înapoi</Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      {showConfetti && <Confetti/>}
      <Link to="/exercitii" className="flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-neon-green mb-6 transition-colors animate-fade-in">
        <ArrowLeft size={15}/> Înapoi la exerciții
      </Link>

      {/* Header */}
      <div className="glass-card p-6 mb-4 animate-fade-in">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="font-mono font-bold text-xl text-white leading-tight">{challenge.title}</h1>
          <div className="flex items-center gap-1.5 shrink-0">
            {!solved && <><Clock size={13} className="text-gray-600"/><span className="font-mono text-sm text-gray-500 tabular-nums">{formatTime(elapsed)}</span></>}
            {solved && <CheckCircle2 size={18} className="text-green-400"/>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`badge ${CAT_CLS[challenge.category]||'badge-web'}`}>{challenge.category}</span>
          <span className={`badge ${DIFF_CLS[challenge.difficulty]||'badge-easy'}`}>{challenge.difficulty}</span>
          <span className="badge bg-neon-green/10 text-neon-green border-neon-green/25 ml-auto flex items-center gap-1">
            <Zap size={11}/>{challenge.xp_reward} XP
          </span>
        </div>
        <p className="font-mono text-gray-400 text-sm leading-relaxed">{challenge.description}</p>
      </div>

      {/* Hint */}
      {challenge.hint && (
        <div className="glass-card p-4 mb-4 border-yellow-700/20 animate-fade-in stagger-1">
          <button onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-2 font-mono text-xs text-yellow-400 hover:text-yellow-300 w-full transition-colors">
            <Lightbulb size={14}/> {showHint ? 'Ascunde indiciu' : 'Arată indiciu (−5 XP moral)'}
          </button>
          {showHint && <p className="font-mono text-xs text-gray-400 mt-2 leading-relaxed pl-5">{challenge.hint}</p>}
        </div>
      )}

      {/* Terminal */}
      <div className="glass-card overflow-hidden animate-fade-in stagger-2">
        <div className="flex items-center gap-2 px-4 py-3 bg-dark-800 border-b border-dark-300/25">
          <Terminal size={14} className="text-neon-green"/>
          <span className="font-mono text-xs text-neon-green">Terminal — CyberForge Shell</span>
          <div className="ml-auto flex gap-1.5">
            {['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} className="w-2.5 h-2.5 rounded-full" style={{background:c}}/>)}
          </div>
        </div>
        <div ref={termRef} className="p-4 h-52 overflow-y-auto font-mono text-sm space-y-1"
          style={{background:'rgba(2,4,8,0.95)'}}>
          {lines.map((l,i) => (
            <div key={i} className={`${l.startsWith('> ✓')?'text-neon-green':l.startsWith('> ✗')?'text-red-400':l.startsWith('> $')?'text-neon-cyan':'text-gray-500'}`}>
              {l}
            </div>
          ))}
          {!solved && <span className="text-neon-green opacity-50 text-xs">█</span>}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-0 border-t border-dark-300/25">
          <span className="font-mono text-neon-green px-4 flex items-center text-sm">$</span>
          <input value={answer} onChange={e=>setAnswer(e.target.value)} disabled={solved||submitting}
            placeholder={solved ? 'Exercițiu rezolvat!' : 'Introdu răspunsul...'}
            className="flex-1 bg-transparent font-mono text-sm text-gray-200 py-3 outline-none placeholder-gray-700 disabled:opacity-50"/>
          <button type="submit" disabled={solved||submitting||!answer.trim()}
            className={`px-4 flex items-center gap-2 font-mono text-sm font-bold transition-all
              ${result==='correct'?'text-green-400':result==='wrong'?'text-red-400 animate-pulse':'text-neon-green hover:text-white disabled:opacity-30'}`}>
            <Send size={14}/>{submitting?'...':'Enter'}
          </button>
        </form>
      </div>

      {solved && (
        <div className="glass-card p-5 mt-4 border-green-700/30 bg-green-900/5 animate-fade-in text-center">
          <CheckCircle2 size={28} className="text-green-400 mx-auto mb-2"/>
          <p className="font-mono font-bold text-green-400 text-sm mb-1">Exercițiu completat!</p>
          <p className="font-mono text-xs text-gray-500 mb-4">Timp: {formatTime(elapsed)}</p>
          <div className="flex gap-3 justify-center">
            <Link to="/exercitii" className="neon-btn text-xs px-4 py-2 rounded-lg">← Exerciții</Link>
            <Link to="/clasament" className="neon-btn-solid text-xs px-4 py-2 rounded-lg">Vezi Clasament</Link>
          </div>
        </div>
      )}
    </div>
  )
}
