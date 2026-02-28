export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-dark-950 flex flex-col items-center justify-center z-50">
      <svg width="60" height="60" viewBox="0 0 64 64" fill="none" className="mb-5">
        <rect width="64" height="64" rx="12" fill="rgba(0,255,136,0.08)" stroke="rgba(0,255,136,0.4)" strokeWidth="1.5"/>
        <path d="M32 8L54 17L54 34Q54 50 32 58Q10 50 10 34L10 17Z" fill="none" stroke="#00ff88" strokeWidth="2"/>
        <path d="M21 32L28 39L44 23" stroke="#00ff88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div className="font-mono text-neon-green font-bold text-lg tracking-widest mb-4">CYBERFORGE</div>
      <div className="flex gap-1.5">
        {[0,1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-neon-green animate-pulse" style={{animationDelay:`${i*0.2}s`}}/>)}
      </div>
    </div>
  )
}
