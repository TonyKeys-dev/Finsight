'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { getProfile, getSession, updateDisplayName } from '@/lib/auth'
import { Copy, ExternalLink, Link2, Loader2, UserRound } from 'lucide-react'

export default function SettingsPage() {
  const [code, setCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const businessNumber = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER?.replace(/\D/g, '')

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) { setProfileLoading(false); return }
      const name = await getProfile(session.user.id)
      setDisplayName(name ?? '')
      setProfileLoading(false)
    })
  }, [])

  const createCode = async () => {
    setLoading(true); setError(null); setCopied(false)
    const session = await getSession()
    if (!session) { setLoading(false); setError('Sesi sudah berakhir. Silakan masuk kembali.'); return }
    const response = await fetch('/api/whatsapp/link-code', { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` } })
    const data = await response.json()
    setLoading(false)
    if (!response.ok) { setError(data.error ?? 'Gagal membuat kode.'); return }
    setCode(data.code)
  }

  const copyCommand = async () => {
    if (!code) return
    await navigator.clipboard.writeText(`HUBUNGKAN ${code}`)
    setCopied(true)
  }

  const saveProfile = async () => {
    const value = displayName.trim()
    if (value.length < 2 || value.length > 40) { setProfileMessage('Nama tampilan harus 2–40 karakter.'); return }
    setProfileSaving(true); setProfileMessage(null)
    const session = await getSession()
    if (!session) { setProfileSaving(false); setProfileMessage('Sesi sudah berakhir. Silakan masuk kembali.'); return }
    const { error: saveError } = await updateDisplayName(session.user.id, value)
    setProfileSaving(false)
    if (saveError) { setProfileMessage('Gagal menyimpan nama tampilan.'); return }
    setProfileMessage('Nama tampilan berhasil disimpan.')
    window.dispatchEvent(new Event('finsight-profile-updated'))
  }

  return (
    <AppShell>
      <div className="p-5 md:p-8 max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Pengaturan</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Hubungkan WhatsApp untuk mencatat transaksi lewat chat.</p>
        </div>
        <section className="bg-white dark:bg-zinc-900 border border-yellow-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-zinc-800 text-yellow-600 dark:text-yellow-400 flex items-center justify-center shrink-0"><UserRound size={19} /></div>
            <div><h3 className="font-bold text-zinc-900 dark:text-white">Profil</h3><p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Nama ini tampil di header aplikasi Anda.</p></div>
          </div>
          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <input value={displayName} disabled={profileLoading || profileSaving} maxLength={40} onChange={(event) => setDisplayName(event.target.value)} placeholder="Nama tampilan"
              className="flex-1 px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:border-yellow-400 focus:outline-none text-zinc-900 dark:text-white disabled:opacity-60" />
            <button onClick={saveProfile} disabled={profileLoading || profileSaving} className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 text-black dark:disabled:text-zinc-400 font-bold text-sm px-4 py-2.5 rounded-xl">{profileSaving ? 'Menyimpan...' : 'Simpan nama'}</button>
          </div>
          {profileMessage && <p className={`mt-3 text-sm ${profileMessage.includes('berhasil') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>{profileMessage}</p>}
        </section>
        <section className="bg-white dark:bg-zinc-900 border border-yellow-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0"><Link2 size={19} /></div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white">Hubungkan WhatsApp</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Kode berlaku 15 menit dan hanya boleh digunakan oleh nomor WhatsApp Anda.</p>
            </div>
          </div>
          {!code ? (
            <button onClick={createCode} disabled={loading} className="mt-5 bg-yellow-400 hover:bg-yellow-500 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 text-black dark:disabled:text-zinc-400 font-bold text-sm px-4 py-2.5 rounded-xl flex items-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" />Membuat kode...</> : 'Buat kode penghubung'}
            </button>
          ) : (
            <div className="mt-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 p-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Kirim pesan berikut ke nomor WhatsApp FinSight:</p>
              <div className="mt-3 flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-200 dark:border-zinc-700">
                <code className="font-bold text-zinc-900 dark:text-white">HUBUNGKAN {code}</code>
                <button onClick={copyCommand} className="text-yellow-600 dark:text-yellow-400 text-sm font-semibold flex items-center gap-1"><Copy size={15} />{copied ? 'Tersalin' : 'Salin'}</button>
              </div>
              {businessNumber ? (
                <a href={`https://wa.me/${businessNumber}?text=${encodeURIComponent(`HUBUNGKAN ${code}`)}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"><ExternalLink size={15} />Buka chat WhatsApp FinSight</a>
              ) : (
                <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">Nomor WA FinSight belum disetel. Tambahkan <code>NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER</code> di Vercel, format internasional tanpa tanda +, lalu redeploy.</p>
              )}
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Setelah terhubung, contoh pesan: <span className="font-semibold">makan 25 ribu</span>. Bot akan meminta konfirmasi sebelum menyimpan.</p>
            </div>
          )}
          {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
        </section>
      </div>
    </AppShell>
  )
}
