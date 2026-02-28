import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { notify } from '../components/Notification'
import { Settings, Plus, Pencil, Trash2, Users, Sword, Save, X, Search, RefreshCw, Shield, Zap } from 'lucide-react'

const EMPTY = { title:'', description:'', category:'Securitate Web', difficulty:'Ușor', correct_answer:'', xp_reward:50, hint:'', is_daily:false }

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative glass-card w-full max-w-lg p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-mono font-bold text-lg text-neon-green">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors"><X size={18}/></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function AdminPanel() {
  const [tab, setTab] = useState('challenges')
  const [challenges, setChallenges] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [search, setSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [{ data: ch }, { data: us }] = await Promise.all([
      supabase.from('challenges').select('*').order('created_at', { ascending: false }),
      supabase.from('users').select('*').order('xp', { ascending: false })
    ])
    setChallenges(ch || [])
    setUsers(us || [])
    setLoading(false)
  }

  function openCreate() { setForm(EMPTY); setEditing(null); setModal(true) }
  function openEdit(c) { setForm({ ...c, hint: c.hint || '', is_daily: c.is_daily || false }); setEditing(c.id); setModal(true) }

  async function saveChallenge(e) {
    e.preventDefault()
    try {
      const payload = { ...form, xp_reward: Number(form.xp_reward) }
      if (editing) {
        const { error } = await supabase.from('challenges').update(payload).eq('id', editing)
        if (error) throw error
        notify('Exercițiu actualizat!', 'success')
      } else {
        const { error } = await supabase.from('challenges').insert(payload)
        if (error) throw error
        notify('Exercițiu creat!', 'success')
      }
      setModal(false); loadAll()
    } catch (err) { notify(err.message, 'error') }
  }

  async function deleteChallenge(id) {
    if (!confirm('Ștergi exercițiul? Toate submission-urile asociate vor fi șterse.')) return
    const { error } = await supabase.from('challenges').delete().eq('id', id)
    if (error) return notify(error.message, 'error')
    notify('Exercițiu șters.', 'info'); loadAll()
  }

  async function toggleDaily(c) {
    const { error } = await supabase.from('challenges').update({ is_daily: !c.is_daily }).eq('id', c.id)
    if (error) return notify(error.message, 'error')
    notify(c.is_daily ? 'Eliminat din Daily' : 'Setat ca Daily Challenge!', 'success')
    loadAll()
  }

  async function changeRole(userId, role) {
    const { error } = await supabase.from('users').update({ role }).eq('id', userId)
    if (error) return notify(error.message, 'error')
    notify('Rol schimbat: ' + role, 'success'); loadAll()
  }

  async function resetXP(userId) {
    if (!confirm('Resetezi XP-ul acestui utilizator la 0?')) return
    const { error } = await supabase.from('users').update({ xp: 0 }).eq('id', userId)
    if (error) return notify(error.message, 'error')
    notify('XP resetat.', 'info'); loadAll()
  }

  async function deleteUser(userId) {
    if (!confirm('Ștergi utilizatorul? Acțiunea este ireversibilă.')) return
    const { error } = await supabase.from('users').delete().eq('id', userId)
    if (error) return notify(error.message, 'error')
    notify('Utilizator șters.', 'info'); loadAll()
  }

  const inp = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) })

  const filteredCh = challenges.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  )
  const filteredUs = users.filter(u =>
    u.username.toLowerCase().includes(userSearch.toLowerCase())
  )

  const totalXP = users.reduce((a, u) => a + (u.xp || 0), 0)
  const admins  = users.filter(u => u.role === 'admin').length

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-mono font-bold text-2xl text-white mb-1 flex items-center gap-3">
          <Settings size={22} className="text-neon-green"/> Admin Panel <span className="terminal-cursor"/>
        </h1>
        <p className="font-mono text-gray-500 text-sm">Gestionează exercițiile și utilizatorii platformei.</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label:'Exerciții', val:challenges.length, color:'text-neon-green', icon:Sword },
          { label:'Utilizatori', val:users.length, color:'text-neon-cyan', icon:Users },
          { label:'Admini', val:admins, color:'text-yellow-400', icon:Shield },
          { label:'XP Total', val:totalXP, color:'text-purple-400', icon:Zap },
        ].map(({ label, val, color, icon:Icon }) => (
          <div key={label} className="stat-card text-center">
            <Icon size={16} className={`${color} mx-auto mb-2`}/>
            <div className={`font-mono font-bold text-xl ${color}`}>{val}</div>
            <div className="font-mono text-xs text-gray-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { id:'challenges', icon:Sword, label:`Exerciții (${challenges.length})` },
          { id:'users',      icon:Users, label:`Utilizatori (${users.length})` }
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'tab-btn flex items-center gap-2 ' + (tab===t.id?'active':'')}>
            <t.icon size={14}/>{t.label}
          </button>
        ))}
        <button onClick={loadAll} className="ml-auto text-gray-600 hover:text-neon-green transition-colors p-2" title="Reîncarcă">
          <RefreshCw size={15}/>
        </button>
      </div>

      {/* CHALLENGES TAB */}
      {tab === 'challenges' && (
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"/>
              <input className="input-field pl-9 text-sm" placeholder="Caută exerciții..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <button onClick={openCreate} className="neon-btn-solid text-sm px-4 py-2 rounded-lg flex items-center gap-2 shrink-0">
              <Plus size={14}/> Adaugă exercițiu
            </button>
          </div>
          <div className="glass-card overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-300/30">
                  {['Titlu','Categorie','Dificultate','XP','Daily','Acțiuni'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-xs text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-6 text-center font-mono text-gray-600 animate-pulse">Se încarcă...</td></tr>
                ) : filteredCh.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center font-mono text-gray-600">Niciun exercițiu găsit.</td></tr>
                ) : filteredCh.map(c => (
                  <tr key={c.id} className="border-b border-dark-300/10 hover:bg-dark-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm text-gray-300 max-w-[160px] truncate">{c.title}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs whitespace-nowrap ${c.category==='Securitate Web'?'badge-web':c.category==='Securitate Rețea'?'badge-network':'badge-crypto'}`}>{c.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge whitespace-nowrap ${c.difficulty==='Ușor'?'badge-easy':c.difficulty==='Mediu'?'badge-medium':'badge-hard'}`}>{c.difficulty}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-neon-green font-bold">{c.xp_reward}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleDaily(c)}
                        className={`font-mono text-xs px-2 py-1 rounded border transition-colors ${c.is_daily?'bg-yellow-900/30 text-yellow-400 border-yellow-700/30':'text-gray-600 border-dark-300 hover:text-yellow-400'}`}>
                        {c.is_daily ? '⚡ Da' : '—'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)} className="text-gray-500 hover:text-neon-cyan transition-colors p-1" title="Editează"><Pencil size={14}/></button>
                        <button onClick={() => deleteChallenge(c.id)} className="text-gray-500 hover:text-red-400 transition-colors p-1" title="Șterge"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {tab === 'users' && (
        <div>
          <div className="relative mb-4">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"/>
            <input className="input-field pl-9 text-sm" placeholder="Caută utilizatori..." value={userSearch} onChange={e=>setUserSearch(e.target.value)}/>
          </div>
          <div className="glass-card overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-300/30">
                  {['Utilizator','XP','Nivel','Streak','Rol','Acțiuni'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-xs text-gray-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-6 text-center font-mono text-gray-600 animate-pulse">Se încarcă...</td></tr>
                ) : filteredUs.map(u => (
                  <tr key={u.id} className="border-b border-dark-300/10 hover:bg-dark-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-dark-700 border border-dark-300/30 flex items-center justify-center text-xs text-gray-400 font-bold shrink-0">
                          {u.username[0].toUpperCase()}
                        </div>
                        <span className="truncate max-w-[120px]">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-neon-green font-bold tabular-nums">{u.xp || 0}</td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-500">{Math.floor((u.xp||0)/500)+1}</td>
                    <td className="px-4 py-3 font-mono text-sm text-orange-400">{u.streak || 0} 🔥</td>
                    <td className="px-4 py-3">
                      <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                        className="bg-dark-800 border border-dark-300 text-gray-300 font-mono text-xs rounded px-2 py-1">
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => resetXP(u.id)} className="text-gray-500 hover:text-yellow-400 transition-colors p-1 font-mono text-xs" title="Reset XP">
                          <Zap size={13}/>
                        </button>
                        <button onClick={() => deleteUser(u.id)} className="text-gray-500 hover:text-red-400 transition-colors p-1" title="Șterge">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <Modal title={editing ? 'Editează Exercițiu' : 'Exercițiu Nou'} onClose={() => setModal(false)}>
          <form onSubmit={saveChallenge} className="flex flex-col gap-4">
            <div>
              <label className="font-mono text-xs text-gray-400 mb-1.5 block">TITLU *</label>
              <input type="text" required className="input-field text-sm" placeholder="Ex: SQL Injection Basics" {...inp('title')}/>
            </div>
            <div>
              <label className="font-mono text-xs text-gray-400 mb-1.5 block">DESCRIERE *</label>
              <textarea rows={3} required className="input-field text-sm resize-none" placeholder="Descrierea exercițiului..." {...inp('description')}/>
            </div>
            <div>
              <label className="font-mono text-xs text-gray-400 mb-1.5 block">RĂSPUNS CORECT *</label>
              <input type="text" required className="input-field text-sm" placeholder="flag{raspuns_corect}" {...inp('correct_answer')}/>
            </div>
            <div>
              <label className="font-mono text-xs text-gray-400 mb-1.5 block">INDICIU (opțional)</label>
              <input type="text" className="input-field text-sm" placeholder="Un mic ajutor..." {...inp('hint')}/>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-mono text-xs text-gray-400 mb-1.5 block">CATEGORIE</label>
                <select className="input-field text-sm" {...inp('category')}>
                  {['Securitate Web','Securitate Rețea','Criptografie'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono text-xs text-gray-400 mb-1.5 block">DIFICULTATE</label>
                <select className="input-field text-sm" {...inp('difficulty')}>
                  {['Ușor','Mediu','Greu'].map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono text-xs text-gray-400 mb-1.5 block">XP REWARD</label>
                <input type="number" min="10" max="500" className="input-field text-sm" {...inp('xp_reward')}/>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="is_daily" checked={form.is_daily}
                onChange={e=>setForm({...form,is_daily:e.target.checked})}
                className="w-4 h-4 accent-neon-green"/>
              <label htmlFor="is_daily" className="font-mono text-xs text-gray-400 cursor-pointer">Setează ca Exercițiu Zilnic ⚡</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="neon-btn-solid flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                <Save size={14}/>{editing?'Salvează':'Creează'}
              </button>
              <button type="button" onClick={() => setModal(false)} className="neon-btn flex-1 py-2.5 text-sm">Anulează</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
