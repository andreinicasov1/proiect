import { Link } from 'react-router-dom'
import { Shield, Zap, Trophy, Users, Lock, Globe, Cpu, ChevronRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-950 text-gray-200">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-dark-950/80 backdrop-blur-md border-b border-dark-300/20">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg width="30" height="30" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="10" fill="rgba(0,255,136,0.07)" stroke="rgba(0,255,136,0.45)" strokeWidth="1.5"/>
              <path d="M32 8L54 17L54 34Q54 50 32 58Q10 50 10 34L10 17Z" fill="none" stroke="#00ff88" strokeWidth="2"/>
              <path d="M21 32L28 39L44 23" stroke="#00ff88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-mono font-bold text-neon-green tracking-wider">CYBERFORGE</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/autentificare" className="font-mono text-sm text-gray-400 hover:text-neon-green transition-colors px-4 py-2">Autentificare</Link>
            <Link to="/inregistrare" className="neon-btn-solid text-sm px-5 py-2 rounded-lg">Înregistrare</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-green/3 to-transparent pointer-events-none"/>
        <div className="max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-green/25 bg-neon-green/5 font-mono text-xs text-neon-green mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse"/>
            Platformă activă — Antrenează-te acum
          </div>
          <h1 className="font-mono font-bold text-4xl md:text-5xl text-white mb-5 leading-tight">
            Devino un<br/><span className="text-neon-green" style={{textShadow:'0 0 30px rgba(0,255,136,0.5)'}}>Cyber Expert</span>
          </h1>
          <p className="font-mono text-gray-400 text-base max-w-xl mx-auto mb-10 leading-relaxed">
            Platformă interactivă de training în securitate cibernetică. Rezolvă exerciții CTF, câștigă XP, urcă în clasament și demonstrează-ți abilitățile.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/inregistrare" className="neon-btn-solid px-8 py-3 rounded-lg font-mono font-bold text-sm flex items-center justify-center gap-2">
              <Zap size={16}/> Începe Gratuit
            </Link>
            <Link to="/autentificare" className="neon-btn px-8 py-3 rounded-lg font-mono text-sm flex items-center justify-center gap-2">
              <Lock size={16}/> Am deja cont
            </Link>
          </div>
        </div>
        {/* Stats */}
        <div className="max-w-3xl mx-auto mt-16 grid grid-cols-3 gap-4 animate-fade-in stagger-2">
          {[
            { n:'500+', l:'Exerciții CTF' },
            { n:'10K+', l:'Utilizatori activi' },
            { n:'3',    l:'Categorii de atac' },
          ].map(({ n, l }) => (
            <div key={l} className="glass-card py-5 px-3">
              <div className="font-mono font-bold text-2xl text-neon-green mb-1" style={{textShadow:'0 0 15px rgba(0,255,136,0.4)'}}>{n}</div>
              <div className="font-mono text-xs text-gray-500">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-5 border-t border-dark-300/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-mono font-bold text-2xl text-white text-center mb-3">Tot ce ai nevoie</h2>
          <p className="font-mono text-gray-500 text-sm text-center mb-12">O platformă completă pentru securitate cibernetică</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon:Globe,  title:'Securitate Web',      desc:'SQL Injection, XSS, CSRF, IDOR și alte vulnerabilități web practice.',    color:'text-blue-400',   bg:'bg-blue-900/15 border-blue-700/25' },
              { icon:Cpu,    title:'Securitate Rețea',    desc:'Scanare porturi, firewall, analiză trafic, atacuri man-in-the-middle.',    color:'text-purple-400', bg:'bg-purple-900/15 border-purple-700/25' },
              { icon:Lock,   title:'Criptografie',        desc:'Hash-uri, cifre clasice, RSA, AES — învață să spargi și să protejezi.',    color:'text-orange-400', bg:'bg-orange-900/15 border-orange-700/25' },
              { icon:Trophy, title:'CTF Mode',            desc:'Competiții cu timer și clasament în timp real între toți utilizatorii.',   color:'text-yellow-400', bg:'bg-yellow-900/15 border-yellow-700/25' },
              { icon:Zap,    title:'Sistem XP & Rank',    desc:'Câștigă XP, avansează în rang și deblochează badge-uri exclusive.',        color:'text-neon-green', bg:'bg-green-900/15 border-green-700/25' },
              { icon:Users,  title:'Clasament Global',    desc:'Compară-te cu alți hackeri. Top 50 actualizat în timp real.',              color:'text-neon-cyan',  bg:'bg-cyan-900/15 border-cyan-700/25' },
            ].map(({ icon:Icon, title, desc, color, bg }) => (
              <div key={title} className={`glass-card p-5 border transition-all duration-300 hover:-translate-y-1 ${bg}`}>
                <Icon size={22} className={`${color} mb-3`}/>
                <h3 className="font-mono font-semibold text-gray-200 text-sm mb-2">{title}</h3>
                <p className="font-mono text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-5 text-center border-t border-dark-300/20">
        <div className="max-w-xl mx-auto">
          <h2 className="font-mono font-bold text-2xl text-white mb-4">Gata să începi?</h2>
          <p className="font-mono text-gray-500 text-sm mb-8">Creează-ți contul gratuit și începe primul exercițiu în mai puțin de 2 minute.</p>
          <Link to="/inregistrare" className="neon-btn-solid px-10 py-3 rounded-lg font-mono font-bold text-sm inline-flex items-center gap-2">
            Creează cont gratuit <ChevronRight size={16}/>
          </Link>
        </div>
      </section>

      <footer className="py-6 border-t border-dark-300/20 text-center">
        <p className="font-mono text-xs text-gray-700">© 2026 CyberForge — Platformă de training în securitate cibernetică</p>
      </footer>
    </div>
  )
}
