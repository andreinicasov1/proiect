import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Trophy, Zap, Medal, Flame } from 'lucide-react'

export default function Leaderboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('users').select('id,username,xp,role,streak')
      .order('xp',{ascending:false}).limit(50)
      .then(({data})=>{ setUsers(data||[]); setLoading(false) })
  }, [])

  const medalCls = [
    'text-yellow-400 drop-shadow-[0_0_8px_rgba(255,200,0,0.7)]',
    'text-gray-300 drop-shadow-[0_0_6px_rgba(200,200,200,0.5)]',
    'text-orange-400 drop-shadow-[0_0_6px_rgba(255,150,0,0.5)]',
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-mono font-bold text-2xl text-white mb-1 flex items-center gap-3">
          <Trophy size={22} className="text-yellow-400"/>Clasament <span className="terminal-cursor"/>
        </h1>
        <p className="font-mono text-gray-500 text-sm">Top utilizatori după XP acumulat.</p>
      </div>
      <div className="glass-card overflow-hidden animate-fade-in stagger-1">
        <div className="px-5 py-3 border-b border-dark-300/30 grid grid-cols-12 font-mono text-xs text-gray-600 uppercase tracking-wider">
          <span className="col-span-1">#</span>
          <span className="col-span-7">Utilizator</span>
          <span className="col-span-2 text-right">Niv.</span>
          <span className="col-span-2 text-right">XP</span>
        </div>
        {loading ? (
          <div className="p-4 flex flex-col gap-2">{[...Array(8)].map((_,i)=><div key={i} className="h-12 bg-dark-800 rounded animate-pulse"/>)}</div>
        ) : users.length===0 ? (
          <div className="py-16 text-center font-mono text-gray-600">Niciun utilizator.</div>
        ) : users.map((u,i) => {
          const isMe = u.id===user?.id
          const level = Math.floor((u.xp||0)/500)+1
          return (
            <div key={u.id} className={`px-5 py-4 grid grid-cols-12 items-center border-b border-dark-300/10 transition-colors
              ${isMe?'bg-neon-green/5 border-l-2 border-l-neon-green':'hover:bg-dark-800/40'}
              ${i===0?'bg-yellow-900/10':i===1?'bg-gray-800/20':i===2?'bg-orange-900/10':''}`}>
              <div className="col-span-1 font-mono text-sm font-bold">
                {i<3?<Medal size={18} className={medalCls[i]}/>:<span className="text-gray-600">{i+1}</span>}
              </div>
              <div className="col-span-7 flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm shrink-0
                  ${isMe?'bg-neon-green/20 border border-neon-green/40 text-neon-green':'bg-dark-700 border border-dark-300/30 text-gray-400'}`}>
                  {u.username[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className={`font-mono text-sm font-semibold truncate ${isMe?'text-neon-green':'text-gray-300'}`}>
                    {u.username}{isMe&&<span className="text-xs text-neon-green/50 ml-1">(tu)</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {u.role==='admin'&&<span className="badge bg-neon-green/10 text-neon-green border-neon-green/30 text-[10px]">ADMIN</span>}
                    {(u.streak||0)>2&&<span className="flex items-center gap-0.5 font-mono text-[10px] text-orange-400"><Flame size={10}/>{u.streak}</span>}
                  </div>
                </div>
              </div>
              <div className="col-span-2 text-right font-mono text-xs text-gray-600">{level}</div>
              <div className="col-span-2 text-right flex items-center justify-end gap-1">
                <Zap size={11} className="text-neon-green"/>
                <span className="font-mono text-sm font-bold text-neon-green tabular-nums">{u.xp||0}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
