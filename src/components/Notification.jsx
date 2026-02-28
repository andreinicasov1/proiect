import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

let notifyFn = null
export function notify(msg, type = 'info') { if (notifyFn) notifyFn(msg, type) }

export default function NotificationProvider() {
  const [items, setItems] = useState([])
  useEffect(() => {
    notifyFn = (msg, type) => {
      const id = Date.now()
      setItems(prev => [...prev, { id, msg, type }])
      setTimeout(() => setItems(prev => prev.filter(n => n.id !== id)), 4500)
    }
  }, [])
  const icons = {
    success: <CheckCircle size={15} className="text-neon-green shrink-0"/>,
    error:   <XCircle size={15} className="text-red-400 shrink-0"/>,
    warning: <AlertTriangle size={15} className="text-yellow-400 shrink-0"/>,
    info:    <Info size={15} className="text-neon-cyan shrink-0"/>,
  }
  const borders = { success:'rgba(0,255,136,0.4)', error:'rgba(255,51,102,0.4)', warning:'rgba(255,204,0,0.4)', info:'rgba(0,229,255,0.4)' }
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-xs w-full">
      {items.map(n => (
        <div key={n.id} className="glass-card flex items-start gap-3 p-3 animate-fade-in"
          style={{ borderColor: borders[n.type] || borders.info }}>
          {icons[n.type]}
          <span className="font-mono text-xs text-gray-300 flex-1">{n.msg}</span>
          <button onClick={() => setItems(p => p.filter(x => x.id !== n.id))} className="text-gray-600 hover:text-gray-300"><X size={13}/></button>
        </div>
      ))}
    </div>
  )
}
