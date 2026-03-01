import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Zap, Target, CheckCircle2, Award, Shield, Flame, Clock } from 'lucide-react'

const BADGES = [
  { id:'first',   label:'Prima Rezolvare', icon:'🎯', desc:'50+ XP',  req: x=>x>=50 },
  { id:'century', label:'Centurion',       icon:'💯', desc:'100+ XP', req: x=>x>=100 },
  { id:'hacker',  label:'Hacker',          icon:'💻', desc:'500+ XP', req: x=>x>=500 },
  { id:'elite',   label:'Elite',           icon:'⚡', desc:'1000+ XP',req: x=>x>=1000 },
  { id:'master',  label:'Cyber Master',    icon:'🛡️', desc:'2000+ XP',req: x=>x>=2000 },
  { id:'legend',  label:'Legend',          icon:'🔥', desc:'5000+ XP',req: x=>x>=5000 },
  { id:'streak3', label:'On Fire',         icon:'🔥', desc:'3 zile streak', req: (_,s)=>s>=3 },
  { id:'streak7', label:'Week Warrior',    icon:'📅', desc:'7 zile streak', req: (_,s)=>s>=7 },
]

function getRank(xp) {
  if (xp>=5000) return { label:'Elite Hacker',   color:'text-red-400',    bg:'bg-red-900/20 border-red-700/40' }
  if (xp>=2000) return { label:'Senior Analyst', color:'text-purple-400', bg:'bg-purple-900/20 border-purple-700/40' }
  if (xp>=1000) return { label:'Specialist',     color:'text-neon-cyan',  bg:'bg-cyan-900/20 border-cyan-700/40' }
  if (xp>=500)  return { label:'Junior Analyst', color:'text-blue-400',   bg:'bg-blue-900/20 border-blue-700/40' }
  return               { label:'Recruit',         color:'text-gray-400',   bg:'bg-dark-700 border-dark-300' }
}

export default function Profile() {
  const { profile, user } = useAuth()
  const [stats, setStats] = useState({ correct:0, total:0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ count:total }, { count:correct }] = await Promise.all([
        supabase.from('submissions').select('*',{count:'exact',head:true}).eq('user_id',user.id),
        supabase.from('submissions').select('*',{count:'exact',head:true}).eq('user_id',user.id).eq('is_correct',true),
      ])
      setStats({ total:total||0, correct:correct||0 })
      setLoading(false)
    }
    if (user) load()
  }, [user])

  const xp     = profile?.xp || 0
  const streak = profile?.streak || 0
  const level  = Math.floor(xp/500)+1
  const rank   = getRank(xp)
  const xpInLvl= xp%500
  const pct    = (xpInLvl/500)*100
  const earned = BADGES.filter(b=>b.req(xp,streak))

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-mono font-bold text-2xl text-white mb-1">Profil <span className="terminal-cursor"/></h1>
      </div>

      <div className="glass-card p-8 mb-5 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-green/30 to-neon-cyan/20 border-2 border-neon-green/40 flex items-center justify-center shrink-0"
            style={{boxShadow:'0 0 30px rgba(0,255,136,0.2)'}}>
            <span className="font-mono font-bold text-3xl text-neon-green">{profile?.username?.[0]?.toUpperCase()||'?'}</span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-mono font-bold text-xl text-white mb-2">{profile?.username}</h2>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
              <span className={`badge ${rank.bg} ${rank.color} flex items-center gap-1`}><Shield size={11}/>{rank.label}</span>
              {streak>0 && <span className="badge bg-orange-900/30 text-orange-400 border-orange-700/30 flex items-center gap-1"><Flame size={11}/>{streak} zile streak</span>}
            </div>
            <div className="mt-2">
              <div className="flex justify-between mb-1">
                <span className="font-mono text-xs text-gray-500">Nivel {level}</span>
                <span className="font-mono text-xs text-neon-green">{xpInLvl}/500 XP</span>
              </div>
              <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-green to-neon-cyan rounded-full xp-bar-fill"
                  style={{width:`${pct}%`,boxShadow:'0 0 8px rgba(0,255,136,0.5)'}}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 animate-fade-in stagger-2">
        {[
          { icon:Zap,          label:'XP Total',    val:xp,           color:'text-neon-green' },
          { icon:Target,       label:'Nivel',       val:level,        color:'text-neon-cyan' },
          { icon:CheckCircle2, label:'Rezolvate',   val:stats.correct,color:'text-green-400' },
          { icon:Flame,        label:'Streak',      val:streak,       color:'text-orange-400' },
        ].map(({icon:Icon,label,val,color})=>(
          <div key={label} className="stat-card text-center">
            <Icon size={18} className={`${color} mx-auto mb-2`}/>
            <div className={`font-mono font-bold text-xl ${color}`}>{val}</div>
            <div className="font-mono text-xs text-gray-600 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 animate-fade-in stagger-3">
        <div className="flex items-center gap-2 mb-4">
          <Award size={16} className="text-yellow-400"/>
          <h2 className="font-mono font-semibold text-gray-300 text-sm">Badge-uri</h2>
          <span className="badge bg-yellow-900/30 text-yellow-400 border-yellow-700/30 ml-auto">{earned.length}/{BADGES.length}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BADGES.map(b => {
            const has = b.req(xp, streak)
            return (
              <div key={b.id} className={`p-4 rounded-lg border text-center transition-all duration-300
                ${has?'bg-dark-700/80 border-neon-green/30':'bg-dark-900/50 border-dark-300/20 opacity-40 grayscale'}`}>
                <div className="text-2xl mb-1">{b.icon}</div>
                <div className={`font-mono text-xs font-semibold ${has?'text-neon-green':'text-gray-600'}`}>{b.label}</div>
                <div className="font-mono text-[10px] text-gray-600 mt-0.5">{b.desc}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
