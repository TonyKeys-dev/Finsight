'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp, getSession } from '@/lib/auth'
import { Loader2, TrendingUp } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    getSession().then((s) => { if (s) router.replace('/dashboard'); else setLoading(false) })
  }, [router])

  const handleSubmit = async () => {
    if (!email || !password) { setError('Email dan password wajib diisi.'); return }
    if (password.length < 6) { setError('Password minimal 6 karakter.'); return }
    setSubmitting(true); setError(null); setSuccess(null)

    if (tab === 'login') {
      const { error: err } = await signIn(email, password)
      setSubmitting(false)
      if (err) { setError('Email atau password salah.'); return }
      router.replace('/dashboard')
    } else {
      const { error: err } = await signUp(email, password)
      setSubmitting(false)
      if (err) { setError(err); return }
      setSuccess('Akun berhasil dibuat! Silakan masuk.')
      setTab('login')
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <Loader2 size={32} className="animate-spin text-yellow-500" />
    </div>
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50/50 via-white to-amber-50/30 dark:from-black dark:via-zinc-950 dark:to-zinc-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Brand */}
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <TrendingUp size={32} className="text-black" />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">FinSight</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Kelola keuangan pribadi dengan cerdas</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-yellow-200/80 dark:border-zinc-800 p-6 flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800/80 rounded-xl p-1">
            {(['login','register'] as const).map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(null); setSuccess(null) }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === t ? 'bg-yellow-400 text-black shadow-sm dark:bg-yellow-400 dark:text-black' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}>
                {t === 'login' ? 'Masuk' : 'Daftar'}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <input type="email" inputMode="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Email"
              className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800/80 border-2 border-yellow-200 dark:border-zinc-700 rounded-xl focus:border-yellow-400 focus:outline-none dark:text-white transition-colors" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Password (min. 6 karakter)"
              className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800/80 border-2 border-yellow-200 dark:border-zinc-700 rounded-xl focus:border-yellow-400 focus:outline-none dark:text-white transition-colors" />
          </div>

          {error && <p className="text-rose-500 text-sm font-medium text-center">{error}</p>}
          {success && <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium text-center">{success}</p>}

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 text-black font-bold text-base py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
            {submitting ? <><Loader2 size={18} className="animate-spin text-black" />Memproses...</> : (tab === 'login' ? 'Masuk' : 'Buat Akun')}
          </button>
        </div>
      </div>
    </main>
  )
}