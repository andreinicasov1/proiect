import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { notify } from '../components/Notification'
import {
  Users, Plus, X, Save, Shield, Crown, Star, UserMinus,
  UserPlus, Zap, Trophy, Hash, ChevronRight, LogOut, Check, Clock, BarChart2
} from 'lucide-react'

// ── helpers ──────────────────────────────────────────────────────
const ROLE_BADGE = {
  owner:   'bg-yellow-900/30 text-yellow-400 border-yellow-700/30',
  officer: 'bg-blue-900/30   text-blue-400   border-blue-700/30',
  member:  'bg-dark-700      text-gray-400   border-dark-300/30',
}
const ROLE_ICON = { owner: Crown, officer: Star, member: Users }

function Avatar({ name, size = 8 }) {
  return (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-neon-green/20 to-neon-cyan/10
      border border-neon-green/25 flex items-center justify-center font-mono font-bold text-neon-green text-sm shrink-0`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

// ── CLAN DETAIL VIEW ─────────────────────────────────────────────
function ClanDetail({ clan, currentMember, onLeave, onRefresh, isAdmin }) {
  const { user } = useAuth()
  const [members, setMembers]     = useState([])
  const [requests, setRequests]   = useState([])
  const [stats, setStats]         = useState(null)
  const [tab, setTab]             = useState('members')
  const [inviteUsername, setInviteUsername] = useState('')
  const [loading, setLoading]     = useState(true)

  const isOwner   = currentMember?.role === 'owner'
  const isOfficer = currentMember?.role === 'officer'
  const canManage = isOwner || isOfficer || isAdmin

  useEffect(() => { loadAll() }, [clan.id])

  async function loadAll() {
    setLoading(true)
    const [{ data: mem }, { data: req }, { data: subs }] = await Promise.all([
      supabase.from('clan_members')
        .select('id, role, joined_at, users(id, username, xp)')
        .eq('clan_id', clan.id)
        .order('joined_at'),
      canManage
        ? supabase.from('clan_requests')
            .select('id, user_id, created_at, users(username)')
            .eq('clan_id', clan.id).eq('status', 'pending')
        : { data: [] },
      supabase.from('submissions')
        .select('user_id, is_correct, challenges(xp_reward)')
        .in('user_id', [])  // placeholder
    ])
    setMembers(mem || [])
    setRequests(req || [])

    // Stats
    const totalXP  = (mem || []).reduce((s, m) => s + (m.users?.xp || 0), 0)
    const topMember = [...(mem || [])].sort((a,b) => (b.users?.xp||0) - (a.users?.xp||0))[0]
    setStats({ memberCount: (mem||[]).length, totalXP, topMember })
    setLoading(false)
  }

  async function kickMember(memberId, username) {
    if (!confirm(`Elimini pe ${username} din clan?`)) return
    const { error } = await supabase.from('clan_members').delete().eq('id', memberId)
    if (error) return notify(error.message, 'error')
    notify(`${username} eliminat.`, 'info')
    loadAll(); onRefresh()
  }

  async function promoteToOfficer(memberId, username) {
    const { error } = await supabase.from('clan_members').update({ role: 'officer' }).eq('id', memberId)
    if (error) return notify(error.message, 'error')
    notify(`${username} promovat la Ofițer!`, 'success')
    loadAll()
  }

  async function demoteToMember(memberId, username) {
    const { error } = await supabase.from('clan_members').update({ role: 'member' }).eq('id', memberId)
    if (error) return notify(error.message, 'error')
    notify(`${username} retrogradat la Membru.`, 'info')
    loadAll()
  }

  async function approveRequest(reqId, reqUserId, username) {
    const { error: insErr } = await supabase.from('clan_members')
      .insert({ clan_id: clan.id, user_id: reqUserId, role: 'member' })
    if (insErr) return notify(insErr.message, 'error')
    await supabase.from('clan_requests').update({ status: 'approved' }).eq('id', reqId)
    notify(`${username} a fost acceptat!`, 'success')
    loadAll(); onRefresh()
  }

  async function rejectRequest(reqId, username) {
    await supabase.from('clan_requests').update({ status: 'rejected' }).eq('id', reqId)
    notify(`${username} respins.`, 'info')
    loadAll()
  }

  async function sendInvite() {
    if (!inviteUsername.trim()) return
    const { data: targetUser } = await supabase
      .from('users').select('id').eq('username', inviteUsername.trim()).maybeSingle()
    if (!targetUser) return notify('Utilizator inexistent!', 'error')
    const { data: alreadyMember } = await supabase
      .from('clan_members').select('id').eq('user_id', targetUser.id).maybeSingle()
    if (alreadyMember) return notify('Userul e deja într-un clan!', 'error')
    const { error } = await supabase.from('clan_requests')
      .insert({ clan_id: clan.id, user_id: targetUser.id, status: 'pending' })
    if (error) return notify('Invitație deja trimisă sau eroare!', 'error')
    notify(`Invitație trimisă lui ${inviteUsername}!`, 'success')
    setInviteUsername('')
  }

  const tabs = [
    { id: 'members',  label: 'Membri',     icon: Users,    badge: members.length },
    { id: 'requests', label: 'Cereri',      icon: Clock,    badge: requests.length, adminOnly: true },
    { id: 'invite',   label: 'Invitație',   icon: UserPlus, adminOnly: true },
    { id: 'stats',    label: 'Statistici',  icon: BarChart2 },
  ]

  return (
    <div className="glass-card overflow-hidden animate-fade-in">
      {/* Header clan */}
      <div className="p-6 border-b border-dark-300/25 bg-gradient-to-r from-neon-green/5 to-transparent">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-cyan/10
              border border-neon-green/30 flex items-center justify-center">
              <span className="font-mono font-black text-neon-green text-lg">[{clan.tag}]</span>
            </div>
            <div>
              <h2 className="font-mono font-bold text-xl text-white">{clan.name}</h2>
              <p className="font-mono text-sm text-gray-500 mt-0.5">{clan.description || 'Fără descriere'}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 font-mono text-xs text-neon-green">
                  <Zap size={11}/>{clan.xp || 0} XP
                </span>
                <span className="flex items-center gap-1 font-mono text-xs text-gray-500">
                  <Users size={11}/>{members.length} membri
                </span>
              </div>
            </div>
          </div>
          {currentMember && !isOwner && (
            <button onClick={onLeave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-700/30
                text-red-400 hover:bg-red-900/20 font-mono text-xs transition-colors">
              <LogOut size={13}/> Părăsește
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-300/25 overflow-x-auto">
        {tabs.filter(t => !t.adminOnly || canManage).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 font-mono text-xs whitespace-nowrap transition-colors
              ${tab === t.id
                ? 'text-neon-green border-b-2 border-neon-green bg-neon-green/5'
                : 'text-gray-500 hover:text-gray-300'}`}>
            <t.icon size={13}/>
            {t.label}
            {t.badge > 0 && (
              <span className="bg-neon-green/20 text-neon-green text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex flex-col gap-3">{[1,2,3].map(i=><div key={i} className="h-14 bg-dark-800 rounded animate-pulse"/>)}</div>
        ) : (
          <>
            {/* MEMBRI */}
            {tab === 'members' && (
              <div className="flex flex-col gap-2">
                {members.length === 0 ? (
                  <p className="font-mono text-sm text-gray-600 text-center py-8">Niciun membru.</p>
                ) : members.map(m => {
                  const Icon = ROLE_ICON[m.role] || Users
                  const isSelf = m.users?.id === user.id
                  return (
                    <div key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
                      ${isSelf ? 'border-neon-green/20 bg-neon-green/5' : 'border-dark-300/20 bg-dark-800/30'}`}>
                      <Avatar name={m.users?.username}/>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm text-gray-200 font-semibold">{m.users?.username}</span>
                          {isSelf && <span className="font-mono text-[10px] text-neon-cyan">(tu)</span>}
                          <span className={`badge text-[10px] flex items-center gap-1 ${ROLE_BADGE[m.role]}`}>
                            <Icon size={9}/>
                            {m.role === 'owner' ? 'Owner' : m.role === 'officer' ? 'Ofițer' : 'Membru'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Zap size={9} className="text-neon-green"/>
                          <span className="font-mono text-xs text-neon-green tabular-nums">{m.users?.xp || 0} XP</span>
                        </div>
                      </div>
                      {/* Acțiuni owner/officer */}
                      {canManage && !isSelf && m.role !== 'owner' && (
                        <div className="flex items-center gap-1">
                          {isOwner && m.role === 'member' && (
                            <button onClick={() => promoteToOfficer(m.id, m.users?.username)}
                              className="p-1.5 rounded-lg hover:bg-yellow-900/20 text-yellow-500 hover:text-yellow-400 transition-colors"
                              title="Promovează la Ofițer">
                              <Star size={13}/>
                            </button>
                          )}
                          {isOwner && m.role === 'officer' && (
                            <button onClick={() => demoteToMember(m.id, m.users?.username)}
                              className="p-1.5 rounded-lg hover:bg-gray-700/30 text-gray-500 hover:text-gray-400 transition-colors"
                              title="Retrogradează la Membru">
                              <Users size={13}/>
                            </button>
                          )}
                          <button onClick={() => kickMember(m.id, m.users?.username)}
                            className="p-1.5 rounded-lg hover:bg-red-900/20 text-red-500 hover:text-red-400 transition-colors"
                            title="Dă afară din clan">
                            <UserMinus size={13}/>
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* CERERI */}
            {tab === 'requests' && canManage && (
              <div className="flex flex-col gap-2">
                {requests.length === 0 ? (
                  <div className="text-center py-10">
                    <Clock size={22} className="text-gray-700 mx-auto mb-2"/>
                    <p className="font-mono text-sm text-gray-600">Nicio cerere în așteptare.</p>
                  </div>
                ) : requests.map(r => (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-dark-300/20 bg-dark-800/30">
                    <Avatar name={r.users?.username}/>
                    <div className="flex-1">
                      <span className="font-mono text-sm text-gray-200">{r.users?.username}</span>
                      <div className="font-mono text-[10px] text-gray-600 mt-0.5">
                        {new Date(r.created_at).toLocaleDateString('ro-RO')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveRequest(r.id, r.user_id, r.users?.username)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-green/10
                          text-neon-green border border-neon-green/25 hover:bg-neon-green/20 font-mono text-xs transition-colors">
                        <Check size={12}/> Accept
                      </button>
                      <button onClick={() => rejectRequest(r.id, r.users?.username)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/10
                          text-red-400 border border-red-700/25 hover:bg-red-900/20 font-mono text-xs transition-colors">
                        <X size={12}/> Refuz
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* INVITATIE */}
            {tab === 'invite' && canManage && (
              <div className="max-w-sm">
                <p className="font-mono text-sm text-gray-400 mb-4">
                  Trimite o cerere de alăturare unui utilizator după username.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteUsername}
                    onChange={e => setInviteUsername(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendInvite()}
                    placeholder="username..."
                    className="input-field text-sm flex-1"
                  />
                  <button onClick={sendInvite}
                    className="neon-btn-solid px-4 py-2 text-sm flex items-center gap-2 rounded-lg">
                    <UserPlus size={14}/> Trimite
                  </button>
                </div>
                <p className="font-mono text-xs text-gray-600 mt-3">
                  * Utilizatorul va vedea cererea și o poate accepta sau respinge.
                </p>
              </div>
            )}

            {/* STATISTICI */}
            {tab === 'stats' && stats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-5 text-center">
                  <Users size={20} className="text-neon-cyan mx-auto mb-2"/>
                  <div className="font-mono text-3xl font-black text-white tabular-nums">{stats.memberCount}</div>
                  <div className="font-mono text-xs text-gray-500 mt-1">Membri Totali</div>
                </div>
                <div className="glass-card p-5 text-center">
                  <Zap size={20} className="text-neon-green mx-auto mb-2"/>
                  <div className="font-mono text-3xl font-black text-neon-green tabular-nums">{stats.totalXP}</div>
                  <div className="font-mono text-xs text-gray-500 mt-1">XP Combinat</div>
                </div>
                <div className="glass-card p-5 text-center">
                  <Trophy size={20} className="text-yellow-400 mx-auto mb-2"/>
                  <div className="font-mono text-lg font-black text-yellow-400 truncate">
                    {stats.topMember?.users?.username || '—'}
                  </div>
                  <div className="font-mono text-xs text-gray-500 mt-1">Top Performer</div>
                  {stats.topMember && (
                    <div className="font-mono text-xs text-neon-green tabular-nums mt-0.5">
                      {stats.topMember.users?.xp || 0} XP
                    </div>
                  )}
                </div>

                {/* Lista membri sortata dupa XP */}
                <div className="col-span-full glass-card p-4">
                  <p className="font-mono text-xs text-gray-600 uppercase tracking-wider mb-3">Clasament Intern</p>
                  <div className="flex flex-col gap-2">
                    {[...members].sort((a,b)=>(b.users?.xp||0)-(a.users?.xp||0)).map((m,i)=>(
                      <div key={m.id} className="flex items-center gap-3">
                        <span className="font-mono text-xs text-gray-600 w-5 text-right">{i+1}</span>
                        <Avatar name={m.users?.username} size={7}/>
                        <span className="font-mono text-sm text-gray-300 flex-1">{m.users?.username}</span>
                        <div className="flex items-center gap-1">
                          <Zap size={10} className="text-neon-green"/>
                          <span className="font-mono text-xs text-neon-green tabular-nums">{m.users?.xp||0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── MAIN PAGE ────────────────────────────────────────────────────
export default function Clans() {
  const { user, isAdmin } = useAuth()
  const [clans, setClans]           = useState([])
  const [myClan, setMyClan]         = useState(null)
  const [myMembership, setMyMembership] = useState(null)
  const [myRequests, setMyRequests] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm]             = useState({ name:'', tag:'', description:'' })

  useEffect(() => { loadAll() }, [user])

  async function loadAll() {
    setLoading(true)
    const [{ data: clansData }, { data: mem }, { data: reqs }] = await Promise.all([
      supabase.from('clans')
        .select('id, name, tag, description, xp, owner_id, users!clans_owner_id_fkey(username)')
        .order('xp', { ascending: false }),
      supabase.from('clan_members')
        .select('id, role, clan_id, clans(id, name, tag, description, xp, owner_id, users!clans_owner_id_fkey(username))')
        .eq('user_id', user.id).maybeSingle(),
      supabase.from('clan_requests')
        .select('clan_id, status').eq('user_id', user.id).eq('status', 'pending'),
    ])
    setClans(clansData || [])
    setMyMembership(mem || null)
    setMyClan(mem?.clans || null)
    setMyRequests(reqs || [])
    setLoading(false)
  }

  async function createClan(e) {
    e.preventDefault()
    const tag = form.tag.toUpperCase().trim()
    if (tag.length < 2 || tag.length > 5) return notify('Tag-ul trebuie să aibă 2–5 caractere!', 'error')
    try {
      const { data: clan, error } = await supabase.from('clans')
        .insert({ name: form.name.trim(), tag, description: form.description, owner_id: user.id, xp: 0 })
        .select().single()
      if (error) throw error
      await supabase.from('clan_members').insert({ clan_id: clan.id, user_id: user.id, role: 'owner' })
      notify(`Clanul [${tag}] a fost creat!`, 'success')
      setShowCreate(false); setForm({ name:'', tag:'', description:'' }); loadAll()
    } catch(err) { notify(err.message, 'error') }
  }

  async function joinRequest(clanId) {
    const { error } = await supabase.from('clan_requests')
      .insert({ clan_id: clanId, user_id: user.id })
    if (error) return notify('Cerere deja trimisă!', 'error')
    notify('Cerere trimisă!', 'success'); loadAll()
  }

  async function leaveClan() {
    if (!confirm('Ești sigur că vrei să părăsești clanul?')) return
    await supabase.from('clan_members').delete().eq('user_id', user.id)
    notify('Ai părăsit clanul.', 'info'); loadAll()
  }

  const inp = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) })

  if (loading) return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4 animate-fade-in">
      {[1,2,3].map(i=><div key={i} className="glass-card h-24 animate-pulse"/>)}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-mono font-bold text-2xl text-white mb-1 flex items-center gap-3">
            <Shield size={22} className="text-neon-green"/> Clanuri <span className="terminal-cursor"/>
          </h1>
          <p className="font-mono text-gray-500 text-sm">Alătură-te sau creează un clan.</p>
        </div>
        {!myClan && (
          <button onClick={() => setShowCreate(true)}
            className="neon-btn-solid text-sm px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={14}/> Crează Clan
          </button>
        )}
      </div>

      {/* Dacă e în clan → arată detalii clan */}
      {myClan && (
        <div className="mb-8">
          <p className="font-mono text-xs text-gray-600 uppercase tracking-wider mb-3">Clanul Tău</p>
          <ClanDetail
            clan={myClan}
            currentMember={myMembership}
            onLeave={leaveClan}
            onRefresh={loadAll}
            isAdmin={isAdmin}
          />
        </div>
      )}

      {/* Lista toate clanurile */}
      {!myClan && (
        <>
          <p className="font-mono text-xs text-gray-600 uppercase tracking-wider mb-3">
            Toate Clanurile ({clans.length})
          </p>
          {clans.length === 0 ? (
            <div className="glass-card py-16 text-center">
              <Shield size={28} className="text-gray-700 mx-auto mb-2"/>
              <p className="font-mono text-sm text-gray-600 mb-4">Niciun clan creat încă.</p>
              <button onClick={() => setShowCreate(true)} className="neon-btn-solid text-sm px-5 py-2 rounded-lg">
                Creează primul clan
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {clans.map(c => {
                const hasPending = myRequests.some(r => r.clan_id === c.id)
                return (
                  <div key={c.id} className="glass-card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-neon-green/8 border border-neon-green/20
                      flex items-center justify-center shrink-0">
                      <span className="font-mono font-black text-neon-green text-sm">[{c.tag}]</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono font-bold text-gray-200">{c.name}</div>
                      <div className="font-mono text-xs text-gray-600 mt-0.5 truncate">
                        {c.description || 'Fără descriere'} · Owner: {c.users?.username}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Zap size={10} className="text-neon-green"/>
                        <span className="font-mono text-xs text-neon-green">{c.xp || 0} XP</span>
                      </div>
                    </div>
                    {hasPending ? (
                      <span className="badge bg-yellow-900/20 text-yellow-400 border-yellow-700/25 text-xs flex items-center gap-1">
                        <Clock size={10}/> În așteptare
                      </span>
                    ) : (
                      <button onClick={() => joinRequest(c.id)}
                        className="neon-btn text-xs px-4 py-2 rounded-lg flex items-center gap-1.5">
                        <UserPlus size={12}/> Alătură-te
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* MODAL CREARE CLAN */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreate(false)}/>
          <div className="relative glass-card w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-mono font-bold text-lg text-neon-green">Crează Clan</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-gray-300"><X size={18}/></button>
            </div>
            <form onSubmit={createClan} className="flex flex-col gap-4">
              <div>
                <label className="font-mono text-xs text-gray-400 mb-1.5 block">NUME CLAN *</label>
                <input type="text" required minLength={3} maxLength={32}
                  className="input-field text-sm" placeholder="Ex: Shadow Wolves" {...inp('name')}/>
              </div>
              <div>
                <label className="font-mono text-xs text-gray-400 mb-1.5 block">TAG (2–5 litere) *</label>
                <input type="text" required minLength={2} maxLength={5}
                  className="input-field text-sm uppercase" placeholder="Ex: SWF" {...inp('tag')}/>
                <p className="font-mono text-[10px] text-gray-600 mt-1">Va apărea ca [TAG] lângă numele clanului.</p>
              </div>
              <div>
                <label className="font-mono text-xs text-gray-400 mb-1.5 block">DESCRIERE</label>
                <textarea rows={2} maxLength={200} className="input-field text-sm resize-none"
                  placeholder="Câteva cuvinte despre clan..." {...inp('description')}/>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="neon-btn-solid flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                  <Save size={14}/> Creează
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="neon-btn flex-1 py-2.5 text-sm">
                  Anulează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
