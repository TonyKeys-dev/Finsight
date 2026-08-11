'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { TrendingUp, Loader2, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase injects session from URL hash after redirect
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  const handleReset = async () => {
    if (!password) { setError('Masukkan password baru.'); return }
    if (password.length < 6) { setError('Password minimal 6 karakter.'); return }
    if (password !== confirm) { setError('Password tidak cocok.'); return }
    setLoading(true); setError(null)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError('Gagal reset password. Coba minta link baru.'); return }
    setSuccess(true)
    setTimeout(() => router.replace('/login'), 2500)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <TrendingUp size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Reset Password</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Masukkan password baru kamu</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-4">
          {success ? (
            <div className="text-center py-4">
              <p className="text-green-500 font-semibold">Password berhasil direset! 🎉</p>
              <p className="text-gray-400 text-sm mt-1">Mengalihkan ke halaman login...</p>
            </div>
          ) : !ready ? (
            <div className="text-center py-4">
              <Loader2 size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Memverifikasi link reset...</p>
            </div>
          ) : (
            <>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password baru (min. 6 karakter)"
                  className="w-full px-4 py-3 pr-12 text-sm bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none dark:text-white transition-colors"
                />
                <button onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <input
                type={show ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReset()}
                placeholder="Konfirmasi password baru"
                className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none dark:text-white transition-colors"
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button onClick={handleReset} disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={18} className="animate-spin" />Menyimpan...</> : 'Simpan Password Baru'}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
