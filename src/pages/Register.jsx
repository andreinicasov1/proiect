import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { notify } from '../components/Notification'
import { Lock, Mail, User, Eye, EyeOff, UserPlus } from 'lucide-react'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username:'', email:'', password:'', confirm:'' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (form.username.length < 3) e.username = 'Minim 3 caractere'
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Doar litere, cifre, underscore'
    if (!form.email.includes('@')) e.email = 'Email invalid'
    if (form.password.length < 6) e.password = 'Minim 6 caractere'
    if (form.password !== form.confirm) e.confirm = 'Parolele nu coincid'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await signUp(form.email, form.password, form.username)
      notify('Cont creat! Bine ai venit!', 'success')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.message?.includes('already') ? 'Email-ul este deja înregistrat.' : err.message
      setErrors({ general: msg })
      notify(msg, 'error')
    } finally { setLoading(false) }
  }

  const inp = k => ({ value: form[k], onChange: e => { setForm({...form,[k]:e.target.value}); setErrors({...errors,[k]:''}) } })

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="12" fill="rgba(0,255,136,0.08)" stroke="rgba(0,255,136,0.4)" strokeWidth="1.5"/>
              <path d="M32 8L54 17L54 34Q54 50 32 58Q10 50 10 34L10 17Z" fill="none" stroke="#00ff88" strokeWidth="2"/>
              <path d="M21 32L28 39L44 23" stroke="#00ff88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-mono font-bold text-neon-green tracking-widest text-xl">CYBERFORGE</span>
          </Link>
          <p className="font-mono text-gray-500 text-sm mt-2">Creează-ți contul de hacker</p>
        </div>
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { k:'username', label:'USERNAME', type:'text', icon:User,  ph:'h4ck3r_name',      ac:'username' },
              { k:'email',    label:'EMAIL',    type:'email',icon:Mail,  ph:'hacker@domain.com',ac:'email' },
              { k:'password', label:'PAROLĂ',   type:show?'text':'password', icon:Lock, ph:'••••••••', ac:'new-password' },
              { k:'confirm',  label:'CONFIRMĂ PAROLA', type:show?'text':'password', icon:Lock, ph:'••••••••', ac:'new-password' },
            ].map(({ k, label, type, icon:Icon, ph, ac }) => (
              <div key={k}>
                <label className="font-mono text-xs text-gray-400 mb-1.5 block">{label}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"/>
                  <input type={type} required className={`input-field pl-9 ${errors[k]?'border-red-500/50':''}`}
                    placeholder={ph} autoComplete={ac} {...inp(k)}/>
                  {(k==='password'||k==='confirm') && (
                    <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                      {show?<EyeOff size={15}/>:<Eye size={15}/>}
                    </button>
                  )}
                </div>
                {errors[k] && <p className="font-mono text-xs text-red-400 mt-1">{errors[k]}</p>}
              </div>
            ))}
            {errors.general && (
              <div className="bg-red-900/20 border border-red-700/40 rounded px-3 py-2 font-mono text-xs text-red-400">{errors.general}</div>
            )}
            <button type="submit" disabled={loading} className="neon-btn-solid py-3 rounded-lg w-full flex items-center justify-center gap-2 mt-1">
              {loading ? 'Se creează contul...' : <><UserPlus size={15}/>Creează cont</>}
            </button>
          </form>
          <p className="text-center font-mono text-xs text-gray-600 mt-6">
            Ai deja cont?{' '}
            <Link to="/autentificare" className="text-neon-green hover:underline">Autentifică-te</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
