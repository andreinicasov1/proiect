export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"','monospace'],
        sans: ['"Inter"','sans-serif'],
      },
      colors: {
        neon: { green:'#00ff88', cyan:'#00e5ff', red:'#ff3366', yellow:'#ffcc00', purple:'#bf5fff' },
        dark: { 950:'#020408', 900:'#060d10', 800:'#0a1520', 700:'#0e1f2e', 600:'#132536', 500:'#1a3045', 400:'#1e3a52', 300:'#2a4d68' }
      },
      keyframes: {
        fadeIn:  { from:{ opacity:'0', transform:'translateY(8px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        slideIn: { from:{ opacity:'0', transform:'translateX(-10px)' }, to:{ opacity:'1', transform:'translateX(0)' } },
        pulse2:  { '0%,100%':{ opacity:'1' }, '50%':{ opacity:'0.5' } },
        scan:    { '0%':{ top:'0', opacity:'1' }, '95%':{ opacity:'1' }, '100%':{ top:'100vh', opacity:'0' } },
        countUp: { from:{ opacity:'0', transform:'translateY(10px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
      },
      animation: {
        'fade-in':  'fadeIn 0.4s ease-out both',
        'slide-in': 'slideIn 0.35s ease-out both',
        'scan':     'scan 6s linear infinite',
        'count-up': 'countUp 0.5s ease-out both',
      }
    }
  },
  plugins: []
}
