import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { notify } from '../components/Notification'
import { Users, Plus, Shield, Zap, Crown, LogIn, LogOut, UserPlus, X, Save, Trophy, Swords } from 'lucide-react'

export default function Clans() {
  const { user, profile, refreshProfile } = useAuth()
  const [clans, setClans] = useState([])
  const [myClan, setMyClan] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all') // all | mine
  const [modal, setModal] = useState(false) // create
  const [form, setForm] = useState({ name:'', description:'', tag:'' })
  const [inviteModal, setInviteModal] = useState(false)
  const [inviteUsername, setInviteUsername] = useState('')
  const [requests, setRequests] = useState([])

  useEffect(() => { loadAll() }, [user])

  async function loadAll() {
    setLoading(true)
    const [{ data: clansData }, { data: memberData }] = await Promise.all([
      supabase.from('clans').select('*, clan_members(count), users!clans_owner_id_fkey(username)').order('xp', { ascending: false }),
      supabase.from('clan_members').select('clan_id, role, clans(*)').eq('user_id', user.id).maybeSingle()
    ])
    setClans(clansData || [])
    if (memberData?.clans) {
      setMyClan({ ...memberData.clans, myRole: memberData.role })
      // Load clan members
      const { data: mems } = await supabase.from('clan_members')
        .select('role, users(id,username,xp)')
        .eq('clan_id', memberData.clan_id)
        .order('role')
      setMembers(mems || [])
      // Load pending requests if owner/officer
      if (memberData.role === 'owner' || memberData.role === 'officer') {
        const { data: reqs } = await supabase.from('clan_requests')
          .select('id, users(id,username,xp)').eq('clan_id', memberData.clan_id).eq('status','pending')
        setRequests(reqs || [])
      }
    } else {
      setMyClan(null)
      setMembers([])
    }
    setLoading(false)
  }

  async function createClan(e) {
    e.preventDefault()
    if (myClan) return notify('Ești deja într-un clan!', 'error')
    try {
      const { data, error } = await supabase.from('clans').insert({
        name: form.name, description: form.description,
        tag: form.tag.toUpperCase().slice(0,5), owner_id: user.id
      }).select().single()
      if (error) throw error
      await supabase.from('clan_members').insert({ clan_id: data.id, user_id: user.id, role: 'owner' })
      notify('Clan creat! 🎉', 'success')
      setModal(false); loadAll()
    } catch(err) { notify(err.message, 'error') }
  }

  async function joinClan(clanId) {
    if (myClan) return notify('Ești deja într-un clan!', 'error')
    try {
      const { error } = await supabase.from('clan_requests').insert({ clan_id: clanId, user_id: user.id })
      if (error) throw error
      notify('Cerere trimisă! Așteaptă aprobarea.', 'success')
    } catch(err) { notify('Cerere deja trimisă sau eroare.', 'error') }
  }

  async function leaveClан() {
    if (!confirm('Părăsești clanul?')) return
    await supabase.from('clan_members').delete().eq('user_id', user.id).eq('clan_id', myClan.id)
    notify('Ai părăsit clanul.', 'info'); loadAll(); refreshProfile()
  }

  async function kickMember(membUserId) {
    if (!confirm('Elimini membrul?')) return
    await supabase.from('clan_members').delete().eq('user_id', membUserId).eq('clan_id', myClan.id)
    notify('Membru eliminat.', 'info'); loadAll()
  }

  async function approveRequest(reqId, reqUserId) {
    await supabase.from('clan_members').insert({ clan_id: myClan.id, user_id: reqUserId, role: 'member' })
    await supabase.from('clan_requests').update({ status: 'approved' }).eq('id', reqId)
    notify('Cerere aprobată!', 'success'); loadAll()
  }

  async function rejectRequest(reqId) {
    await supabase.from('clan_requests').update({ status: 'rejected' }).eq('id', reqId)
    notify('Cerere respinsă.', 'info'); loadAll()
  }

  async function promoteOfficer(membUserId) {
    await supabase.from('clan_members').update({ role: 'officer' }).eq('user_id', membUserId).eq('clan_id', myClan.id)
    notify('Promovat la ofițer!', 'success'); loadAll()
  }

  const inp = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) })

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-mono font-bold text-2xl text-white mb-1 flex items-center gap-3">
            <Users size={22} className="text-neon-cyan"/> Clanuri <span className="terminal-cursor"/>
          </h1>
          <p className="font-mono text-gray-500 text-sm">Formează echipe și concurează împreună.</p>
        </div>
        {!myClan && (
          <button onClick={() => setModal(true)} className="neon-btn-solid text-sm px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={14}/> Creează Clan
          </button>
        )}
      </div>

      {/* My Clan Banner */}
      {myClan && (
        <div className="glass-card p-5 mb-6 border-neon-cyan/30 bg-neon-cyan/3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-green/10 border border-neon-cyan/30 flex items-center justify-center font-mono font-black text-neon-cyan text-lg">
                [{myClan.tag}]
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-mono font-bold text-white text-lg">{myClan.name}</h2>
                  <span className={`badge text-xs ${myClан?.myRole==='owner'?'bg-yellow-900/30 text-yellow-400 border-yellow-700/30':myClan?.myRole==='officer'?'bg-purple-900/30 text-purple-400 border-purple-700/30':'bg-dark-700 text-gray-400 border-dark-300'}`}>
                    {myClan.myRole==='owner'?'👑 Owner':myClan.myRole==='officer'?'⭐ Ofițer':'🔰 Membru'}
                  </span>
                </div>
                <p className="font-mono text-sm text-gray-400">{myClan.description}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 font-mono text-xs text-neon-green"><Zap size={11}/>{myClan.xp} XP clan</span>
                  <span className="font-mono text-xs text-gray-600">·</span>
                  <span className="flex items-center gap-1 font-mono text-xs text-gray-400"><Users size={11}/>{members.length} membri</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setTab('mine')} className="neon-btn text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Shield size={12}/> Gestionează
              </button>
              {myClan.myRole !== 'owner' && (
                <button onClick={leaveClан} className="font-mono text-xs px-3 py-1.5 rounded-lg border border-red-700/30 text-red-400 hover:bg-red-900/10 transition-colors flex items-center gap-1.5">
                  <LogOut size={12}/> Părăsește
                </button>
              )}
            </div>
          </div>

          {/* Pending requests */}
          {requests.length > 0 && (
            <div className="mt-4 pt-4 border-t border-dark-300/20">
              <p className="font-mono text-xs text-yellow-400 mb-3 flex items-center gap-1.5">
                <UserPlus size={12}/> {requests.length} cerere(i) în așteptare
              </p>
              <div className="flex flex-col gap-2">
                {requests.map(r => (
                  <div key={r.id} className="flex items-center justify-between gap-3 bg-dark-800/50 rounded-lg px-3 py-2">
                    <span className="font-mono text-sm text-gray-300">{r.users?.username}</span>
                    <span className="font-mono text-xs text-neon-green">{r.users?.xp} XP</span>
                    <div className="flex gap-2">
                      <button onClick={() => approveRequest(r.id, r.users?.id)} className="neon-btn-solid text-xs px-2 py-1 rounded">✓ Aprobă</button>
                      <button onClick={() => rejectRequest(r.id)} className="font-mono text-xs px-2 py-1 rounded border border-red-700/30 text-red-400 hover:bg-red-900/10 transition-colors">✗</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('all')} className={`tab-btn ${tab==='all'?'active':''}`}>
          <Swords size={13}/> Toate Clanurile ({clans.length})
        </button>
        {myClan && (
          <button onClick={() => setTab('mine')} className={`tab-btn flex items-center gap-1.5 ${tab==='mine'?'active':''}`}>
            <Users size={13}/> Membrii Mei ({members.length})
          </button>
        )}
      </div>

      {/* ALL CLANS */}
      {tab === 'all' && (
        loading ? (
          <div className="flex flex-col gap-3">{[1,2,3].map(i=><div key={i} className="glass-card h-20 animate-pulse bg-dark-800/40"/>)}</div>
        ) : clans.length === 0 ? (
          <div className="glass-card py-12 text-center">
            <Users size={28} className="text-gray-700 mx-auto mb-2"/>
            <p className="font-mono text-gray-500 text-sm mb-4">Niciun clan creat încă.</p>
            {!myClan && <button onClick={() => setModal(true)} className="neon-btn-solid text-sm px-5 py-2 rounded-lg">Fii primul!</button>}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {clans.map((c, i) => {
              const isMyC = myClan?.id === c.id
              const memberCount = c.clan_members?.[0]?.count || 0
              return (
                <div key={c.id} className={`glass-card p-5 flex items-center gap-4 group transition-all hover:-translate-y-0.5
                  ${isMyC ? 'border-neon-cyan/30' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0
                    ${isMyC?'bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan':'bg-dark-700 border border-dark-300/30 text-gray-400'}`}>
                    [{c.tag}]
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono font-semibold text-gray-200">{c.name}</span>
                      {isMyC && <span className="badge bg-neon-cyan/10 text-neon-cyan border-neon-cyan/25 text-[10px]">Clanul meu</span>}
                      {i === 0 && <span className="badge bg-yellow-900/30 text-yellow-400 border-yellow-700/30 text-[10px]">🏆 #1</span>}
                    </div>
                    <p className="font-mono text-xs text-gray-500 truncate">{c.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 font-mono text-xs text-neon-green"><Zap size={10}/>{c.xp || 0} XP</span>
                      <span className="flex items-center gap-1 font-mono text-xs text-gray-500"><Users size={10}/>{memberCount} membri</span>
                      <span className="font-mono text-xs text-gray-600">Owner: {c.users?.username}</span>
                    </div>
                  </div>
                  {!myClan && (
                    <button onClick={() => joinClan(c.id)}
                      className="neon-btn text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0">
                      <LogIn size={12}/> Alătură-te
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}

      {/* MY CLAN MEMBERS */}
      {tab === 'mine' && myClan && (
        <div className="glass-card overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-300/30">
                {['Utilizator','XP','Rol','Acțiuni'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left font-mono text-xs text-gray-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.users?.id} className="border-b border-dark-300/10 hover:bg-dark-800/40">
                  <td className="px-4 py-3 font-mono text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-dark-700 border border-dark-300/30 flex items-center justify-center text-xs font-bold text-gray-400">
                        {m.users?.username?.[0]?.toUpperCase()}
                      </div>
                      {m.users?.username}
                      {m.users?.id === user.id && <span className="font-mono text-[10px] text-gray-600">(tu)</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-neon-green font-bold tabular-nums">{m.users?.xp || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${m.role==='owner'?'bg-yellow-900/30 text-yellow-400 border-yellow-700/30':m.role==='officer'?'bg-purple-900/30 text-purple-400 border-purple-700/30':'bg-dark-700 text-gray-400 border-dark-300'}`}>
                      {m.role==='owner'?'👑 Owner':m.role==='officer'?'⭐ Ofițer':'🔰 Membru'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {myClan.myRole === 'owner' && m.users?.id !== user.id && (
                      <div className="flex gap-2">
                        {m.role === 'member' && (
                          <button onClick={() => promoteOfficer(m.users?.id)}
                            className="font-mono text-xs text-purple-400 hover:underline">Promovează</button>
                        )}
                        <button onClick={() => kickMember(m.users?.id)}
                          className="font-mono text-xs text-red-400 hover:underline">Elimină</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE CLAN MODAL */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(false)}/>
          <div className="relative glass-card w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-mono font-bold text-lg text-neon-green">Creează Clan Nou</h3>
              <button onClick={() => setModal(false)} className="text-gray-500 hover:text-gray-300"><X size={18}/></button>
            </div>
            <form onSubmit={createClan} className="flex flex-col gap-4">
              <div>
                <label className="font-mono text-xs text-gray-400 mb-1.5 block">NUME CLAN *</label>
                <input type="text" required className="input-field text-sm" placeholder="Ex: CyberHawks" {...inp('name')}/>
              </div>
              <div>
                <label className="font-mono text-xs text-gray-400 mb-1.5 block">TAG CLAN * (max 5 litere)</label>
                <input type="text" required maxLength={5} className="input-field text-sm uppercase" placeholder="Ex: HAWK" {...inp('tag')}/>
              </div>
              <div>
                <label className="font-mono text-xs text-gray-400 mb-1.5 block">DESCRIERE</label>
                <textarea rows={2} className="input-field text-sm resize-none" placeholder="Descrie clanul tău..." {...inp('description')}/>
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
