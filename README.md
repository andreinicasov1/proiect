# 🔐 CyberForge v2 — Platformă de Training Securitate Cibernetică

Platformă full-stack completă pentru antrenamentul în securitate cibernetică.

## 🧱 Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS v3
- **Auth & DB:** Supabase (Auth + PostgreSQL + RLS)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Stil:** Dark mode neon-green hacker aesthetic

## 📄 Pagini

| Pagină | Rută | Acces |
|--------|------|-------|
| Home | `/` | Public |
| Autentificare | `/autentificare` | Public |
| Înregistrare | `/inregistrare` | Public |
| Dashboard | `/dashboard` | User |
| Exerciții | `/exercitii` | User |
| Detalii Exercițiu | `/exercitii/:id` | User |
| Profil | `/profil` | User |
| Clasament | `/clasament` | User |
| CTF Mode | `/ctf` | User |
| Admin Panel | `/admin` | Admin |
| Analytics | `/admin/analytics` | Admin |

## 🚀 Instalare

```bash
cd cyberforge_v2
npm install
cp .env.example .env
# Editează .env cu datele Supabase
npm run dev
```

## 🗄️ Supabase Setup

1. Mergi la **Supabase Dashboard → SQL Editor**
2. Rulează tot conținutul din `supabase/schema.sql`
3. Copiază din **Project Settings → API**: URL și anon key în `.env`

## 👑 Primul Admin

```sql
UPDATE public.users SET role = 'admin' WHERE username = 'username_tau';
```

## 🔧 Variabile de Mediu

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 🏆 Sistem XP & Rank

| XP | Rank |
|----|------|
| 0–499 | Recruit |
| 500–999 | Junior Analyst |
| 1000–1999 | Specialist |
| 2000–4999 | Senior Analyst |
| 5000+ | Elite Hacker |

## ✨ Features Complete

- ✅ Autentificare + înregistrare (Supabase Auth)
- ✅ Sistem XP cu funcție RPC atomică (fără bug-uri RLS)
- ✅ Sistem Streak zilnic (fire emoji 🔥)
- ✅ Daily Challenge (exercițiu zilnic marcat ⚡)
- ✅ CTF Mode (competiție cu timer 10 minute)
- ✅ Admin Panel (CRUD exerciții + gestionare useri)
- ✅ Analytics Dashboard (grafice Recharts)
- ✅ Badge-uri și Rank-uri
- ✅ Terminal simulat cu confetti la rezolvare
- ✅ Design dark neon-green hacker complet
- ✅ Responsive (mobile + desktop)
- ✅ Row Level Security (RLS) pe toate tabelele
