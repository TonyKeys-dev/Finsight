# 💡 FinSight — Personal Finance Tracker

> A web-based personal finance tracker with AI-powered spending analysis, dark/light mode, and monthly report exports.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Groq](https://img.shields.io/badge/AI-Groq%20LLaMA-F55036)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🌟 About

FinSight is a web application for tracking daily income and expenses, complete with AI-powered financial analysis that delivers personalized saving tips in a friendly, conversational tone.

This project is a **full rebuild** of a previous mobile app (React Native/Expo) into a modern web application — more accessible, easier to develop, and deployable without going through the App Store or Play Store.

---

## 🔄 Migration: Expo App → Web App

| Aspect | Old Version (Expo/React Native) | New Version (Next.js Web) |
|---|---|---|
| **Platform** | Mobile app (Android/iOS) | Web app — runs in any browser |
| **Framework** | React Native + Expo | Next.js 15 (App Router) |
| **Distribution** | Install via APK / App Store | Just open the URL — no install needed |
| **Styling** | React Native StyleSheet | Tailwind CSS |
| **Dark Mode** | Manual per component | `next-themes` — instant toggle |
| **Navigation** | Expo Router (file-based) | Next.js App Router |
| **WhatsApp** | Integrated via Meta Cloud API | Removed for now (planned in v2) |
| **Deployment** | Expo EAS Build | Vercel (free, auto-deploy on push) |
| **Updates** | Rebuild + redistribute | Push to GitHub → live instantly |
| **Cross-device** | Install on each device | Open from any device via URL |

### Why move to Web?
- ✅ Faster development — no emulator or physical device needed for testing
- ✅ Instant deploys — push to GitHub and it's live on Vercel
- ✅ No App Store / Play Store submission required
- ✅ Accessible from any phone, tablet, or laptop via browser
- ✅ Consistent dark/light mode across the entire app

---

## ✨ Features

- 🔐 **Auth** — Email/password login & register, session persists automatically (no repeated logins)
- ➕ **Transaction Tracking** — Log income & expenses with categories, notes, and date
- 📊 **Dashboard** — Monthly summary, expense pie chart by category, recent transactions
- 📋 **Monthly Recap** — Category breakdown, filterable by month
- 🤖 **AI Analysis** — Casual, friendly spending insights and saving tips (powered by Groq LLaMA)
- 📥 **Export** — Download monthly report as **Excel (.xlsx)** or **PDF**
- 🌙 **Dark/Light Mode** — Theme toggle, follows system preference by default
- 👤 **Multi-user** — Each account's data is fully isolated

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + Lucide Icons |
| Charts | Recharts |
| Database & Auth | Supabase (PostgreSQL) |
| AI | Groq API — `llama-3.1-8b-instant` |
| Excel Export | SheetJS (xlsx) |
| PDF Export | Browser Print API |
| Dark Mode | next-themes |
| Hosting | Vercel |

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/USERNAME/finsight.git
cd finsight
npm install
```

### 2. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run:

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON transactions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 3. Get a Groq API Key
Sign up for free at [console.groq.com](https://console.groq.com) → API Keys → Create Key

### 4. Configure environment variables
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
GROQ_API_KEY=gsk_xxxx...
```

### 5. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Deploy to Vercel

Connect your GitHub repo to [vercel.com](https://vercel.com), add the same environment variables in the Vercel dashboard, and deploy.

---

## 🗺️ Roadmap

- [x] Income & expense tracking
- [x] Dashboard with pie chart
- [x] Monthly recap
- [x] AI analysis (Groq)
- [x] Export to Excel & PDF
- [x] Dark/light mode
- [x] Multi-user auth
- [ ] WhatsApp integration (v2)
- [ ] Daily reminder notifications
- [ ] Budget targets per category
- [ ] AI-powered spending prediction
- [ ] Multi-currency support

---

## 📄 License

MIT © [TonyKeys](https://github.com/muhammadsultonfatony-coder)