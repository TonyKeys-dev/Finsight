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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
      <Loader2 size={32} className="animate-spin text-amber-400" />
    </div>
  )

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Brand */}
        <div className="text-center">
          <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-400/10">
            <TrendingUp size={28} className="text-black stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">FinSight</h1>
          <p className="text-zinc-400 text-xs mt-1">Kelola keuangan pribadi dengan cerdas</p>
        </div>

        {/* Card */}
        <div className="bg-[#141418] rounded-2xl border border-zinc-800/80 p-5 flex flex-col gap-4 shadow-2xl">

          {/* Forgot password view */}
          {tab === 'forgot' ? (
            <>
              <div className="flex items-center gap-2">
                <button onClick={() => switchTab('login')} className="text-zinc-400 hover:text-white transition-colors">
                  <ArrowLeft size={18} />
                </button>
                <h2 className="font-bold text-white text-sm">Lupa Password</h2>
              </div>
              <p className="text-xs text-zinc-400">
                Masukkan email kamu dan kami akan kirimkan link untuk reset password.
              </p>
              <input type="email" inputMode="email" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Email kamu"
                className="w-full px-3.5 py-2.5 text-xs bg-[#202026] border border-zinc-700/60 rounded-xl focus:border-amber-400 focus:outline-none text-white placeholder-zinc-500 transition-colors" />
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              {success && <p className="text-emerald-400 text-xs text-center">{success}</p>}
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                {submitting ? <><Loader2 size={16} className="animate-spin" />Mengirim...</> : 'Kirim Link Reset'}
              </button>
            </>
          ) : (
            <>
              {/* Login / Register tabs */}
              <div className="flex bg-[#202026] rounded-xl p-1">
                {(['login', 'register'] as const).map((t) => (
                  <button key={t} onClick={() => switchTab(t)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tab === t ? 'bg-amber-400 text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}>
                    {t === 'login' ? 'Masuk' : 'Daftar'}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <input type="email" inputMode="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="Email"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#202026] border border-zinc-700/60 rounded-xl focus:border-amber-400 focus:outline-none text-white placeholder-zinc-500 transition-colors" />

                {/* Password with show/hide */}
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && tab === 'login' && handleSubmit()}
                    placeholder="Password (min. 6 karakter)"
                    className="w-full px-3.5 py-2.5 pr-10 text-xs bg-[#202026] border border-zinc-700/60 rounded-xl focus:border-amber-400 focus:outline-none text-white placeholder-zinc-500 transition-colors"
                  />
                  <button onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
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
                    className="w-full px-3.5 py-2.5 text-xs bg-[#202026] border border-zinc-700/60 rounded-xl focus:border-amber-400 focus:outline-none text-white placeholder-zinc-500 transition-colors"
                  />
                )}
              </div>

              {/* Forgot password link */}
              {tab === 'login' && (
                <div className="text-right -mt-1">
                  <button onClick={() => switchTab('forgot')}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                    Lupa password?
                  </button>
                </div>
              )}

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              {success && <p className="text-emerald-400 text-xs text-center">{success}</p>}

              <button onClick={handleSubmit} disabled={submitting}
                className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-1">
                {submitting
                  ? <><Loader2 size={16} className="animate-spin" />Memproses...</>
                  : tab === 'login' ? 'Masuk' : 'Buat Akun'}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}