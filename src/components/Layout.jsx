import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationProvider from './Notification'
import { LayoutDashboard, Sword, Trophy, User, Settings, LogOut, Menu, X, Shield, Zap, Flame, ChevronRight, Users, BarChart2 } from 'lucide-react'

function XPBar({ xp }) {
  const level = Math.floor(xp / 500) + 1
  const pct = ((xp % 500) / 500) * 100
  return (
    <div className="px-4 pb-3">
      <div className="flex justify-between mb-1">
        <span className="font-mono text-xs text-gray-500">Niv. {level}</span>
        <span className="font-mono text-xs text-neon-green">{xp} XP</span>
      </div>
      <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-neon-green to-neon-cyan rounded-full xp-bar-fill"
          style={{ width:`${pct}%`, boxShadow:'0 0 8px rgba(0,255,136,0.6)' }}/>
      </div>
    </div>
  )
}

const navItems = [
  { to:'/dashboard',  icon:LayoutDashboard, label:'Dashboard' },
  { to:'/exercitii',  icon:Sword,           label:'Exerciții' },
  { to:'/clasament',  icon:Trophy,          label:'Clasament' },
  { to:'/profil',     icon:User,            label:'Profil' },
]

export default function Layout({ children }) {
  const { profile, isAdmin, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  async function handleSignOut() { await signOut(); navigate('/') }

  const streak = profile?.streak || 0

  const SidebarContent = () => (
    <aside className="flex flex-col h-full w-64 bg-dark-900 border-r border-dark-300/25">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-dark-300/25">
        <svg width="34" height="34" viewBox="0 0 64 64" fill="none" className="shrink-0">
          <rect width="64" height="64" rx="10" fill="rgba(0,255,136,0.07)" stroke="rgba(0,255,136,0.45)" strokeWidth="1.5"/>
          <path d="M32 8L54 17L54 34Q54 50 32 58Q10 50 10 34L10 17Z" fill="none" stroke="#00ff88" strokeWidth="2"/>
          <path d="M21 32L28 39L44 23" stroke="#00ff88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div>
          <div className="font-mono font-bold text-neon-green tracking-wider text-sm">CYBERFORGE</div>
          <div className="font-mono text-xs text-gray-600">v2.0 Platform</div>
        </div>
      </div>

      {/* Profile */}
      <div className="px-4 py-4 border-b border-dark-300/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-green/25 to-neon-cyan/15 border border-neon-green/30 flex items-center justify-center font-mono font-bold text-neon-green text-sm shrink-0">
            {profile?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-sm text-gray-200 truncate">{profile?.username}</div>
            <div className="flex items-center gap-2">
              {isAdmin && <span className="badge bg-neon-green/10 text-neon-green border-neon-green/25 text-[10px]">ADMIN</span>}
              {streak > 0 && (
                <span className="flex items-center gap-0.5 font-mono text-xs text-orange-400">
                  <Flame size={11} className="streak-fire"/> {streak}
                </span>
              )}
            </div>
          </div>
        </div>
        <XPBar xp={profile?.xp || 0}/>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon size={16}/><span>{label}</span>
            <ChevronRight size={13} className="ml-auto opacity-20"/>
          </NavLink>
        ))}
        {isAdmin && (
          <>
            <div className="border-t border-dark-300/20 my-2"/>
            <NavLink to="/admin" onClick={() => setOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Settings size={16}/><span>Admin Panel</span>
              <ChevronRight size={13} className="ml-auto opacity-20"/>
            </NavLink>
            <NavLink to="/admin/analytics" onClick={() => setOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <BarChart2 size={16}/><span>Analytics</span>
              <ChevronRight size={13} className="ml-auto opacity-20"/>
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-dark-300/20">
        <button onClick={handleSignOut} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/15">
          <LogOut size={16}/><span>Deconectare</span>
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden relative z-10">
      <NotificationProvider/>
      <div className="hidden lg:flex shrink-0"><SidebarContent/></div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}/>
          <div className="absolute left-0 top-0 bottom-0 z-10 animate-slide-in"><SidebarContent/></div>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-dark-900 border-b border-dark-300/25">
          <button onClick={() => setOpen(true)} className="text-gray-400 hover:text-neon-green transition-colors"><Menu size={20}/></button>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-neon-green"/>
            <span className="font-mono font-bold text-neon-green text-sm tracking-wider">CYBERFORGE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={13} className="text-neon-green"/>
            <span className="font-mono text-xs text-neon-green font-bold">{profile?.xp || 0}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-dark-950">
          <div className="p-4 lg:p-8 animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  )
}
