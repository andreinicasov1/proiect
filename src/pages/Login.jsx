import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { notify } from '../components/Notification'
import { Lock, Mail, Eye, EyeOff, Shield, LogIn } from 'lucide-react'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await signIn(email, password)
      notify('Bine ai revenit!', 'success')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.message?.includes('Invalid') ? 'Email sau parolă incorectă.' : err.message
      setError(msg)
      notify(msg, 'error')
    } finally { setLoading(false) }
  }

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
          <p className="font-mono text-gray-500 text-sm mt-2">Autentifică-te în platformă</p>
        </div>
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="font-mono text-xs text-gray-400 mb-1.5 block">EMAIL</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"/>
                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="hacker@domain.com" className="input-field pl-9"
                  autoComplete="email"/>
              </div>
            </div>
            <div>
              <label className="font-mono text-xs text-gray-400 mb-1.5 block">PAROLĂ</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"/>
                <input type={show?'text':'password'} required value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="••••••••" className="input-field pl-9 pr-10"
                  autoComplete="current-password"/>
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                  {show?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-900/20 border border-red-700/40 rounded px-3 py-2 font-mono text-xs text-red-400 flex items-center gap-2">
                <Lock size={12}/>{error}
              </div>
            )}
            <button type="submit" disabled={loading} className="neon-btn-solid py-3 rounded-lg w-full flex items-center justify-center gap-2 mt-1">
              {loading ? <span className="font-mono text-sm">Se conectează...</span> : <><LogIn size={15}/>Autentifică-te</>}
            </button>
          </form>
          <p className="text-center font-mono text-xs text-gray-600 mt-6">
            Nu ai cont?{' '}
            <Link to="/inregistrare" className="text-neon-green hover:underline">Înregistrează-te</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
