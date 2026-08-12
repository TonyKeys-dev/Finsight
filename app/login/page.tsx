'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp, getSession, resetPassword } from '@/lib/auth'
import { Loader2, TrendingUp, Eye, EyeOff, ArrowLeft } from 'lucide-react'

type Tab = 'login' | 'register' | 'forgot'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    getSession().then((s) => { if (s) router.replace('/dashboard'); else setLoading(false) })
  }, [router])

  const switchTab = (t: Tab) => {
    setTab(t)
    setPassword('')   // clear password setiap ganti tab
    setConfirm('')
    setError(null)
    setSuccess(null)
    setShowPass(false)
  }

  const handleSubmit = async () => {
    if (tab === 'forgot') {
      if (!email) { setError('Masukkan email kamu.'); return }
      setSubmitting(true); setError(null)
      const { error: err } = await resetPassword(email)
      setSubmitting(false)
      if (err) { setError('Gagal mengirim email. Pastikan email terdaftar.'); return }
      setSuccess('Link reset password sudah dikirim! Cek email kamu.')
      return
    }

    if (!email || !password) { setError('Email dan password wajib diisi.'); return }
    if (password.length < 6) { setError('Password minimal 6 karakter.'); return }
    if (tab === 'register' && password !== confirm) { setError('Password tidak cocok.'); return }

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
      setSuccess('Akun berhasil dibuat!')
      switchTab('login')  // switch ke login + clear password
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <Loader2 size={32} className="animate-spin text-yellow-600" />
    </div>
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 to-indigo-100 dark:from-yellow-700 dark:to-black flex items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Brand */}
        <div className="text-center">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <TrendingUp size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">FinSight</h1>
          <p className="text-gray-500 dark:text-white text-sm mt-1">Kelola keuangan pribadi dengan cerdas</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-yellow-950 rounded-3xl shadow-lg border border-gray-100 dark:border-black p-6 flex flex-col gap-4">

          {/* Forgot password view */}
          {tab === 'forgot' ? (
            <>
              <div className="flex items-center gap-2">
                <button onClick={() => switchTab('login')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="font-bold text-gray-900 dark:text-white">Lupa Password</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Masukkan email kamu dan kami akan kirimkan link untuk reset password.
              </p>
              <input type="email" inputMode="email" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Email kamu"
                className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-black border-2 border-black dark:border-black rounded-xl focus:border-yellow-400 focus:outline-none dark:text-white transition-colors" />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              {success && <p className="text-green-500 text-sm text-center">{success}</p>}
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 dark:disabled:bg-black text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                {submitting ? <><Loader2 size={18} className="animate-spin" />Mengirim...</> : 'Kirim Link Reset'}
              </button>
            </>
          ) : (
            <>
              {/* Login / Register tabs */}
              <div className="flex bg-gray-100 dark:bg-black rounded-xl p-1">
                {(['login', 'register'] as const).map((t) => (
                  <button key={t} onClick={() => switchTab(t)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === t ? 'bg-white dark:bg-black text-yellow-600 dark:text-yellow-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                    {t === 'login' ? 'Masuk' : 'Daftar'}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <input type="email" inputMode="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="Email"
                  className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-black rounded-xl focus:border-yellow-500 focus:outline-none dark:text-white transition-colors" />

                {/* Password with show/hide */}
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && tab === 'login' && handleSubmit()}
                    placeholder="Password (min. 6 karakter)"
                    className="w-full px-4 py-3 pr-12 text-sm bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-black rounded-xl focus:border-yellow-500 focus:outline-none dark:text-white transition-colors"
                  />
                  <button onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Confirm password for register */}
                {tab === 'register' && (
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="Konfirmasi password"
                    className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-black rounded-xl focus:border-yellow-500 focus:outline-none dark:text-white transition-colors"
                  />
                )}
              </div>

              {/* Forgot password link */}
              {tab === 'login' && (
                <button onClick={() => switchTab('forgot')}
                  className="text-xs text-white hover:text-yellow-700 dark:text-yellow-400 text-right -mt-1 transition-colors">
                  Lupa password?
                </button>
              )}

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              {success && <p className="text-green-500 text-sm text-center">{success}</p>}

              <button onClick={handleSubmit} disabled={submitting}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 dark:disabled:bg-black text-white font-bold text-base py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                {submitting
                  ? <><Loader2 size={18} className="animate-spin" />Memproses...</>
                  : tab === 'login' ? 'Masuk' : 'Buat Akun'}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
