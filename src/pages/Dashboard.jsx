import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Zap, Target, CheckCircle2, Flame, Trophy, ChevronRight, Clock, Shield } from 'lucide-react'

function getRank(xp) {
  if (xp>=5000) return { label:'Elite Hacker',   color:'text-red-400',    pct:100 }
  if (xp>=2000) return { label:'Senior Analyst', color:'text-purple-400', pct:Math.min(100,((xp-2000)/3000)*100) }
  if (xp>=1000) return { label:'Specialist',     color:'text-neon-cyan',  pct:Math.min(100,((xp-1000)/1000)*100) }
  if (xp>=500)  return { label:'Junior Analyst', color:'text-blue-400',   pct:Math.min(100,((xp-500)/500)*100) }
  return              { label:'Recruit',          color:'text-gray-400',   pct:Math.min(100,(xp/500)*100) }
}

export default function Dashboard() {
  const { profile, user } = useAuth()
  const [recent, setRecent] = useState([])
  const [stats, setStats] = useState({ correct:0, total:0, todayXP:0 })
  const [daily, setDaily] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const today = new Date(); today.setHours(0,0,0,0)
      const [{ data: subs }, { data: allSubs }, { data: dc }] = await Promise.all([
        supabase.from('submissions').select('*, challenges(title,category,xp_reward,difficulty)')
          .eq('user_id', user.id).order('created_at', { ascending:false }).limit(6),
        supabase.from('submissions').select('is_correct,created_at').eq('user_id', user.id),
        supabase.from('challenges').select('id,title,category,difficulty,xp_reward')
          .eq('is_daily', true).maybeSingle(),
      ])
      const correct = (allSubs||[]).filter(s=>s.is_correct).length
      const todayXP = (allSubs||[]).filter(s=>s.is_correct && new Date(s.created_at)>=today)
        .reduce((acc,s)=>acc,0)
      setRecent(subs||[])
      setStats({ correct, total:(allSubs||[]).length, todayXP })
      setDaily(dc)
      setLoading(false)
    }
    if (user) load()
  }, [user])

  const xp    = profile?.xp || 0
  const level = Math.floor(xp/500)+1
  const rank  = getRank(xp)
  const xpInLvl = xp%500
  const pct   = (xpInLvl/500)*100
  const streak = profile?.streak || 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-mono font-bold text-2xl text-white mb-1">
          Bine ai revenit, <span className="text-neon-green">{profile?.username}</span>
          <span className="terminal-cursor"/>
        </h1>
        <p className="font-mono text-gray-500 text-sm">Continuă antrenamentul și urcă în clasament.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-fade-in stagger-1">
        {[
          { icon:Zap,          val:xp,           label:'XP Total',    color:'text-neon-green', sub:`Nivel ${level}` },
          { icon:Flame,        val:streak,        label:'Streak Zile', color:'text-orange-400', sub:streak>0?'🔥 În serie!':'Începe azi' },
          { icon:CheckCircle2, val:stats.correct, label:'Rezolvate',   color:'text-green-400',  sub:`din ${stats.total} încercări` },
          { icon:Trophy,       val:rank.label,    label:'Rang',        color:rank.color,        sub:'Clasament activ', isStr:true },
        ].map(({ icon:Icon, val, label, color, sub, isStr }) => (
          <div key={label} className="stat-card text-center">
            <Icon size={18} className={`${color} mx-auto mb-2`}/>
            <div className={`font-mono font-bold ${isStr?'text-sm':'text-xl'} ${color} mb-0.5`}>{val}</div>
            <div className="font-mono text-xs text-gray-600">{label}</div>
            <div className="font-mono text-[10px] text-gray-700 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* XP Progress */}
      <div className="glass-card p-5 mb-6 animate-fade-in stagger-2">
        <div className="flex justify-between mb-2">
          <span className="font-mono text-xs text-gray-500 flex items-center gap-1.5"><Zap size={11} className="text-neon-green"/>Progres spre Nivel {level+1}</span>
          <span className="font-mono text-xs text-neon-green">{xpInLvl}/500 XP</span>
        </div>
        <div className="h-2.5 bg-dark-600 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-neon-green to-neon-cyan rounded-full xp-bar-fill"
            style={{ width:`${pct}%`, boxShadow:'0 0 10px rgba(0,255,136,0.5)' }}/>
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-mono text-[10px] text-gray-700">Niv. {level}</span>
          <span className="font-mono text-[10px] text-gray-700">Niv. {level+1} ({500-xpInLvl} XP rămași)</span>
        </div>
      </div>

      {/* Daily Challenge */}
      {daily && (
        <div className="glass-card p-5 mb-6 border-yellow-700/30 bg-yellow-900/5 animate-fade-in stagger-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚡</span>
            <span className="font-mono font-bold text-yellow-400 text-sm">EXERCIȚIU ZILNIC</span>
            <span className="badge bg-yellow-900/30 text-yellow-400 border-yellow-700/30 text-[10px] ml-auto">+XP BONUS</span>
          </div>
          <div className="font-mono text-gray-200 text-sm font-semibold mb-1">{daily.title}</div>
          <div className="flex items-center gap-3 mt-3">
            <span className={`badge ${daily.difficulty==='Ușor'?'badge-easy':daily.difficulty==='Mediu'?'badge-medium':'badge-hard'}`}>{daily.difficulty}</span>
            <span className="badge badge-web">{daily.category}</span>
            <Link to={`/exercitii/${daily.id}`} className="ml-auto neon-btn text-xs px-3 py-1.5 rounded flex items-center gap-1">
              Rezolvă <ChevronRight size={12}/>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="glass-card p-5 animate-fade-in stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono font-semibold text-gray-300 text-sm flex items-center gap-2"><Clock size={14} className="text-neon-cyan"/>Activitate Recentă</h2>
          </div>
          {loading ? (
            <div className="flex flex-col gap-2">{[1,2,3].map(i=><div key={i} className="h-12 bg-dark-800 rounded animate-pulse"/>)}</div>
          ) : recent.length === 0 ? (
            <div className="text-center py-8">
              <Shield size={28} className="text-gray-700 mx-auto mb-2"/>
              <p className="font-mono text-xs text-gray-600">Nicio activitate încă.</p>
              <Link to="/exercitii" className="font-mono text-xs text-neon-green hover:underline mt-1 inline-block">Rezolvă primul exercițiu →</Link>
            </div>
          ) : recent.map((s,i) => (
            <Link key={s.id} to={`/exercitii/${s.challenge_id}`}
              className="flex items-center gap-3 py-2.5 border-b border-dark-300/10 last:border-0 hover:bg-dark-800/30 rounded px-1 transition-colors animate-fade-in"
              style={{animationDelay:`${i*0.05}s`}}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${s.is_correct?'bg-green-900/40 border border-green-700/30':'bg-red-900/40 border border-red-700/30'}`}>
                {s.is_correct ? <CheckCircle2 size={14} className="text-green-400"/> : <Target size={14} className="text-red-400"/>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-gray-300 truncate">{s.challenges?.title || 'Exercițiu'}</div>
                <div className="font-mono text-[10px] text-gray-600">{s.challenges?.category}</div>
              </div>
              {s.is_correct && <span className="font-mono text-xs text-neon-green font-bold shrink-0">+{s.challenges?.xp_reward}</span>}
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-3 animate-fade-in stagger-4">
          <div className="font-mono text-xs text-gray-600 px-1">ACȚIUNI RAPIDE</div>
          {[
            { to:'/exercitii', icon:Target, label:'Exerciții noi', desc:'Explorează toate categoriile', color:'text-neon-green', bg:'hover:bg-green-900/10' },
            { to:'/ctf',       icon:Trophy, label:'CTF Mode',      desc:'Competiție cu timer',          color:'text-yellow-400', bg:'hover:bg-yellow-900/10' },
            { to:'/clasament', icon:Trophy, label:'Clasament',      desc:'Vezi top utilizatori',        color:'text-neon-cyan',  bg:'hover:bg-cyan-900/10' },
            { to:'/profil',    icon:Shield, label:'Profilul meu',  desc:'XP, rank, badge-uri',          color:'text-purple-400', bg:'hover:bg-purple-900/10' },
          ].map(({ to, icon:Icon, label, desc, color, bg }) => (
            <Link key={to} to={to} className={`glass-card p-4 flex items-center gap-3 transition-all duration-200 ${bg} hover:-translate-y-0.5 group`}>
              <Icon size={18} className={`${color} shrink-0`}/>
              <div className="flex-1">
                <div className="font-mono text-sm text-gray-200 font-semibold">{label}</div>
                <div className="font-mono text-xs text-gray-600">{desc}</div>
              </div>
              <ChevronRight size={14} className="text-gray-700 group-hover:text-gray-400 transition-colors"/>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
