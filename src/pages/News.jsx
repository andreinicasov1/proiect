import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { notify } from '../components/Notification'
import { Newspaper, Plus, Pencil, Trash2, X, Save, ChevronDown, ChevronUp, Eye } from 'lucide-react'

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  if (s < 60) return 'acum câteva secunde'
  if (s < 3600) return `acum ${Math.floor(s/60)} min`
  if (s < 86400) return `acum ${Math.floor(s/3600)}h`
  return `acum ${Math.floor(s/86400)} zile`
}

const TAG_CLS = {
  'Anunț':    'bg-blue-900/30 text-blue-400 border-blue-700/30',
  'Update':   'bg-neon-green/10 text-neon-green border-neon-green/25',
  'Eveniment':'bg-yellow-900/30 text-yellow-400 border-yellow-700/30',
  'Avertizare':'bg-red-900/30 text-red-400 border-red-700/30',
}

export default function News() {
  const { isAdmin } = useAuth()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [expanded, setExpanded] = useState({})
  const [form, setForm] = useState({ title:'', content:'', tag:'Anunț', pinned:false })

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('news')
      .select('*, users(username)')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
    setNews(data || [])
    setLoading(false)
  }

  function openCreate() { setForm({ title:'', content:'', tag:'Anunț', pinned:false }); setEditing(null); setModal(true) }
  function openEdit(n) { setForm({ title:n.title, content:n.content, tag:n.tag, pinned:n.pinned }); setEditing(n.id); setModal(true) }

  async function save(e) {
    e.preventDefault()
    try {
      if (editing) {
        const { error } = await supabase.from('news').update(form).eq('id', editing)
        if (error) throw error
        notify('Noutate actualizată!', 'success')
      } else {
        const { error } = await supabase.from('news').insert(form)
        if (error) throw error
        notify('Noutate publicată!', 'success')
      }
      setModal(false); load()
    } catch(err) { notify(err.message, 'error') }
  }

  async function del(id) {
    if (!confirm('Ștergi noutatea?')) return
    await supabase.from('news').delete().eq('id', id)
    notify('Șters.', 'info'); load()
  }

  const inp = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) })

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-mono font-bold text-2xl text-white mb-1 flex items-center gap-3">
            <Newspaper size={22} className="text-neon-cyan"/> Noutăți <span className="terminal-cursor"/>
          </h1>
          <p className="font-mono text-gray-500 text-sm">Ultimele știri și anunțuri ale platformei.</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="neon-btn-solid text-sm px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={14}/> Publică
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">{[1,2,3].map(i=><div key={i} className="glass-card h-28 animate-pulse bg-dark-800/40"/>)}</div>
      ) : news.length === 0 ? (
        <div className="glass-card py-16 text-center">
          <Newspaper size={28} className="text-gray-700 mx-auto mb-2"/>
          <p className="font-mono text-gray-500 text-sm">Nicio noutate momentan.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {news.map((n, i) => {
            const isLong = n.content.length > 200
            const isExpanded = expanded[n.id]
            return (
              <div key={n.id} className={`glass-card p-6 animate-fade-in transition-all duration-300
                ${n.pinned ? 'border-neon-cyan/30 bg-neon-cyan/3' : ''}`}
                style={{ animationDelay: `${i*0.05}s` }}>
                {n.pinned && (
                  <div className="flex items-center gap-1.5 font-mono text-xs text-neon-cyan mb-3">
                    <span>📌</span> Fixat în top
                  </div>
                )}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`badge text-xs ${TAG_CLS[n.tag] || TAG_CLS['Anunț']}`}>{n.tag}</span>
                      <h2 className="font-mono font-bold text-gray-100 text-base">{n.title}</h2>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs text-gray-600">
                      <Eye size={11}/>
                      <span>de <span className="text-gray-400">{n.users?.username || 'Admin'}</span></span>
                      <span>·</span>
                      <span>{timeAgo(n.created_at)}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => openEdit(n)} className="text-gray-600 hover:text-neon-cyan transition-colors p-1"><Pencil size={13}/></button>
                      <button onClick={() => del(n.id)} className="text-gray-600 hover:text-red-400 transition-colors p-1"><Trash2 size={13}/></button>
                    </div>
                  )}
                </div>
                <div className={`font-mono text-sm text-gray-400 leading-relaxed whitespace-pre-wrap transition-all duration-300
                  ${isLong && !isExpanded ? 'line-clamp-3' : ''}`}>
                  {n.content}
                </div>
                {isLong && (
                  <button onClick={() => setExpanded(prev => ({ ...prev, [n.id]: !isExpanded }))}
                    className="flex items-center gap-1 font-mono text-xs text-neon-green hover:underline mt-2 transition-colors">
                    {isExpanded ? <><ChevronUp size={12}/> Arată mai puțin</> : <><ChevronDown size={12}/> Citește mai mult</>}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(false)}/>
          <div className="relative glass-card w-full max-w-lg p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-mono font-bold text-lg text-neon-green">{editing ? 'Editează Noutate' : 'Noutate Nouă'}</h3>
              <button onClick={() => setModal(false)} className="text-gray-500 hover:text-gray-300"><X size={18}/></button>
            </div>
            <form onSubmit={save} className="flex flex-col gap-4">
              <div>
                <label className="font-mono text-xs text-gray-400 mb-1.5 block">TITLU *</label>
                <input type="text" required className="input-field text-sm" placeholder="Titlul noutății..." {...inp('title')}/>
              </div>
              <div>
                <label className="font-mono text-xs text-gray-400 mb-1.5 block">CONȚINUT *</label>
                <textarea rows={5} required className="input-field text-sm resize-none" placeholder="Scrie noutatea..." {...inp('content')}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-xs text-gray-400 mb-1.5 block">TAG</label>
                  <select className="input-field text-sm" {...inp('tag')}>
                    {['Anunț','Update','Eveniment','Avertizare'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.pinned}
                      onChange={e=>setForm({...form,pinned:e.target.checked})}
                      className="w-4 h-4 accent-neon-green"/>
                    <span className="font-mono text-xs text-gray-400">📌 Fixează în top</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="neon-btn-solid flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                  <Save size={14}/>{editing?'Salvează':'Publică'}
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
