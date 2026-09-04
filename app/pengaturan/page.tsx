'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { getSession } from '@/lib/auth'
import { Copy, Link2, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const [code, setCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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

  return (
    <AppShell>
      <div className="p-5 md:p-8 max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Pengaturan</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Hubungkan WhatsApp untuk mencatat transaksi lewat chat.</p>
        </div>
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
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Setelah terhubung, contoh pesan: <span className="font-semibold">makan 25 ribu</span>. Bot akan meminta konfirmasi sebelum menyimpan.</p>
            </div>
          )}
          {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
        </section>
      </div>
    </AppShell>
  )
}
