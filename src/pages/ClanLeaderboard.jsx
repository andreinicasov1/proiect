import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Trophy, Zap, Users, Medal, Shield } from 'lucide-react'

export default function ClanLeaderboard() {
  const { user } = useAuth()
  const [clans, setClans] = useState([])
  const [myClanId, setMyClanId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: clansData }, { data: mc }] = await Promise.all([
        supabase.from('clans')
          .select('id, name, tag, xp, description, clan_members(count), users!clans_owner_id_fkey(username)')
          .order('xp', { ascending: false })
          .limit(50),
        supabase.from('clan_members').select('clan_id').eq('user_id', user.id).maybeSingle()
      ])
      setClans(clansData || [])
      setMyClanId(mc?.clan_id || null)
      setLoading(false)
    }
    load()
  }, [user])

  const medalCls = [
    'text-yellow-400 drop-shadow-[0_0_8px_rgba(255,200,0,0.7)]',
    'text-gray-300 drop-shadow-[0_0_6px_rgba(200,200,200,0.5)]',
    'text-orange-400 drop-shadow-[0_0_6px_rgba(255,150,0,0.5)]',
  ]

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-mono font-bold text-2xl text-white mb-1 flex items-center gap-3">
          <Shield size={22} className="text-neon-cyan"/> Clasament Clanuri <span className="terminal-cursor"/>
        </h1>
        <p className="font-mono text-gray-500 text-sm">Top clanuri după XP total acumulat.</p>
      </div>

      {/* Top 3 podium */}
      {!loading && clans.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[clans[1], clans[0], clans[2]].map((c, i) => {
            const rank = i === 0 ? 2 : i === 1 ? 1 : 3
            const sizes = ['h-24','h-32','h-20']
            const borders = ['border-gray-500/40','border-yellow-500/50','border-orange-500/40']
            const glows = ['','drop-shadow-[0_0_12px_rgba(255,200,0,0.3)]','']
            return (
              <div key={c.id} className={`glass-card p-4 flex flex-col items-center justify-end ${sizes[i]} border ${borders[i]} ${glows[i]}
                ${myClanId===c.id?'bg-neon-green/5':''}`}>
                <Medal size={18} className={medalCls[rank-1]}/>
                <div className="font-mono font-black text-xs mt-1 text-center text-gray-300">[{c.tag}]</div>
                <div className="font-mono text-[10px] text-gray-500 truncate w-full text-center">{c.name}</div>
                <div className="flex items-center gap-1 mt-1">
                  <Zap size={9} className="text-neon-green"/>
                  <span className="font-mono text-xs text-neon-green font-bold tabular-nums">{c.xp||0}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-300/30 grid grid-cols-12 font-mono text-xs text-gray-600 uppercase tracking-wider">
          <span className="col-span-1">#</span>
          <span className="col-span-2">Tag</span>
          <span className="col-span-5">Clan</span>
          <span className="col-span-2 text-center">Membri</span>
          <span className="col-span-2 text-right">XP</span>
        </div>
        {loading ? (
          <div className="p-4 flex flex-col gap-2">{[...Array(8)].map((_,i)=><div key={i} className="h-12 bg-dark-800 rounded animate-pulse"/>)}</div>
        ) : clans.length === 0 ? (
          <div className="py-16 text-center font-mono text-gray-600">Niciun clan.</div>
        ) : clans.map((c, i) => {
          const isMyC = c.id === myClanId
          const memberCount = c.clan_members?.[0]?.count || 0
          return (
            <div key={c.id} className={`px-5 py-4 grid grid-cols-12 items-center border-b border-dark-300/10 transition-colors
              ${isMyC?'bg-neon-cyan/5 border-l-2 border-l-neon-cyan':'hover:bg-dark-800/40'}
              ${i===0?'bg-yellow-900/8':i===1?'bg-gray-800/15':i===2?'bg-orange-900/8':''}`}>
              <div className="col-span-1 font-mono text-sm font-bold">
                {i<3?<Medal size={16} className={medalCls[i]}/>:<span className="text-gray-600">{i+1}</span>}
              </div>
              <div className="col-span-2">
                <span className={`font-mono text-xs font-black ${isMyC?'text-neon-cyan':'text-gray-400'}`}>[{c.tag}]</span>
              </div>
              <div className="col-span-5 min-w-0">
                <div className={`font-mono text-sm font-semibold truncate ${isMyC?'text-neon-cyan':'text-gray-300'}`}>
                  {c.name}{isMyC&&<span className="text-xs text-neon-cyan/50 ml-1">(al meu)</span>}
                </div>
                <div className="font-mono text-[10px] text-gray-600">{c.users?.username}</div>
              </div>
              <div className="col-span-2 text-center">
                <span className="flex items-center justify-center gap-1 font-mono text-xs text-gray-500">
                  <Users size={10}/>{memberCount}
                </span>
              </div>
              <div className="col-span-2 text-right flex items-center justify-end gap-1">
                <Zap size={11} className="text-neon-green"/>
                <span className="font-mono text-sm font-bold text-neon-green tabular-nums">{c.xp||0}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
