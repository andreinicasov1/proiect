import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts'
import { BarChart2, Users, Zap, Target, TrendingUp } from 'lucide-react'

const COLORS = ['#00ff88','#00e5ff','#ffcc00','#ff3366','#bf5fff','#ff9944']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div className="glass-card px-3 py-2 border-neon-green/20">
      <p className="font-mono text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((p,i)=>(
        <p key={i} className="font-mono text-xs font-bold" style={{color:p.color||'#00ff88'}}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [data, setData] = useState({ byCategory:[], byDiff:[], topUsers:[], daily:[], overview:{} })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: challenges }, { data: submissions }, { data: users }] = await Promise.all([
        supabase.from('challenges').select('id,category,difficulty,xp_reward'),
        supabase.from('submissions').select('challenge_id,is_correct,created_at,challenges(category,difficulty,xp_reward)'),
        supabase.from('users').select('username,xp,streak').order('xp',{ascending:false}).limit(10),
      ])

      // By category
      const cats = {}
      ;(challenges||[]).forEach(c => { cats[c.category]=(cats[c.category]||0)+1 })
      const byCategory = Object.entries(cats).map(([name,value])=>({name,value}))

      // By difficulty
      const diffs = {}
      ;(challenges||[]).forEach(c => { diffs[c.difficulty]=(diffs[c.difficulty]||0)+1 })
      const byDiff = Object.entries(diffs).map(([name,value])=>({name,value}))

      // Correct vs wrong
      const correct = (submissions||[]).filter(s=>s.is_correct).length
      const wrong   = (submissions||[]).filter(s=>!s.is_correct).length

      // Daily submissions (last 7 days)
      const days = {}
      for (let i=6;i>=0;i--) {
        const d = new Date(); d.setDate(d.getDate()-i)
        const k = d.toLocaleDateString('ro-RO',{weekday:'short'})
        days[k] = 0
      }
      ;(submissions||[]).filter(s=>s.is_correct).forEach(s => {
        const d = new Date(s.created_at)
        const k = d.toLocaleDateString('ro-RO',{weekday:'short'})
        if (days[k]!==undefined) days[k]++
      })
      const daily = Object.entries(days).map(([day,count])=>({day,count}))

      setData({
        byCategory,
        byDiff,
        topUsers: users||[],
        daily,
        overview: {
          totalCh: (challenges||[]).length,
          totalSubs: (submissions||[]).length,
          correctSubs: correct,
          totalUsers: (users||[]).length,
          correctPct: (submissions||[]).length ? Math.round((correct/(submissions||[]).length)*100) : 0,
        }
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4">
      {[1,2,3].map(i=><div key={i} className="glass-card h-40 animate-pulse bg-dark-800/40"/>)}
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-mono font-bold text-2xl text-white mb-1 flex items-center gap-3">
          <BarChart2 size={22} className="text-neon-green"/> Analytics <span className="terminal-cursor"/>
        </h1>
        <p className="font-mono text-gray-500 text-sm">Statistici generale ale platformei.</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon:Target,   label:'Exerciții', val:data.overview.totalCh,    color:'text-neon-green' },
          { icon:Users,    label:'Utilizatori',val:data.overview.totalUsers, color:'text-neon-cyan' },
          { icon:Zap,      label:'Submissions',val:data.overview.totalSubs,  color:'text-yellow-400' },
          { icon:TrendingUp,label:'Rata succes',val:data.overview.correctPct+'%',color:'text-purple-400' },
        ].map(({icon:Icon,label,val,color})=>(
          <div key={label} className="stat-card text-center">
            <Icon size={16} className={`${color} mx-auto mb-2`}/>
            <div className={`font-mono font-bold text-xl ${color}`}>{val}</div>
            <div className="font-mono text-xs text-gray-600">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Daily activity */}
        <div className="glass-card p-5">
          <h3 className="font-mono text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-neon-green"/> Activitate (7 zile)
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.daily} margin={{top:5,right:5,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis dataKey="day" tick={{fill:'#4a6580',fontSize:10,fontFamily:'monospace'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#4a6580',fontSize:10,fontFamily:'monospace'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Line type="monotone" dataKey="count" name="Rezolvări" stroke="#00ff88" strokeWidth={2}
                dot={{fill:'#00ff88',strokeWidth:0,r:3}} activeDot={{r:5,fill:'#00ff88'}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* By category */}
        <div className="glass-card p-5">
          <h3 className="font-mono text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <BarChart2 size={14} className="text-neon-cyan"/> Exerciții pe Categorie
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.byCategory} margin={{top:5,right:5,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis dataKey="name" tick={{fill:'#4a6580',fontSize:9,fontFamily:'monospace'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#4a6580',fontSize:10,fontFamily:'monospace'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="value" name="Exerciții" radius={[4,4,0,0]}>
                {data.byCategory.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By difficulty pie */}
        <div className="glass-card p-5">
          <h3 className="font-mono text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Target size={14} className="text-yellow-400"/> Distribuție Dificultate
          </h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="60%" height={160}>
              <PieChart>
                <Pie data={data.byDiff} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                  dataKey="value" paddingAngle={3}>
                  {data.byDiff.map((_,i)=><Cell key={i} fill={['#00ff88','#ffcc00','#ff3366'][i%3]}/>)}
                </Pie>
                <Tooltip content={<CustomTooltip/>}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {data.byDiff.map((d,i)=>(
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:['#00ff88','#ffcc00','#ff3366'][i%3]}}/>
                  <span className="font-mono text-xs text-gray-400">{d.name}</span>
                  <span className="font-mono text-xs text-gray-300 font-bold ml-1">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Users */}
        <div className="glass-card p-5">
          <h3 className="font-mono text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Users size={14} className="text-purple-400"/> Top Utilizatori XP
          </h3>
          <div className="flex flex-col gap-2">
            {data.topUsers.slice(0,6).map((u,i)=>{
              const maxXp = data.topUsers[0]?.xp||1
              return (
                <div key={u.username} className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-600 w-4 shrink-0">{i+1}</span>
                  <span className="font-mono text-xs text-gray-300 w-24 truncate">{u.username}</span>
                  <div className="flex-1 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${((u.xp||0)/maxXp)*100}%`,background:COLORS[i%COLORS.length]}}/>
                  </div>
                  <span className="font-mono text-xs text-neon-green font-bold w-12 text-right tabular-nums">{u.xp||0}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
