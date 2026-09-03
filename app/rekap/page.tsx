'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { getTransactions, getMonthlySummary, getAvailableMonths } from '@/lib/actions'
import { getSession } from '@/lib/auth'
import { formatRupiah, formatMonthLabel, getCurrentMonth } from '@/lib/utils'
import { CATEGORY_COLORS } from '@/types'
import type { Transaction, MonthlySummary } from '@/types'
import { Sparkles, Loader2, FileSpreadsheet, FileText, Plus } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function RekapPage() {
  const router = useRouter()
  const [months, setMonths] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    getAvailableMonths().then(m => {
      const all = [getCurrentMonth(), ...m.filter(x => x !== getCurrentMonth())]
      setMonths([...new Set(all)])
    })
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    const [s, t] = await Promise.all([getMonthlySummary(selectedMonth), getTransactions(selectedMonth)])
    setSummary(s); setTransactions(t); setAiResult(null); setLoading(false)
  }, [selectedMonth])

  useEffect(() => { load() }, [load])

  const byCategory = transactions.reduce((acc, t) => {
    const key = `${t.type}::${t.category}`
    acc[key] = (acc[key] ?? 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  const handleAI = async () => {
    if (!summary) return
    setAiLoading(true); setAiResult(null)
    const session = await getSession()
    if (!session) {
      setAiLoading(false)
      setAiResult('Sesi kamu sudah berakhir. Silakan masuk kembali.')
      return
    }
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ month: selectedMonth })
    })
    const data = await res.json()
    setAiLoading(false)
    setAiResult(data.result ?? data.error ?? 'Gagal menganalisis.')
  }

  const exportExcel = () => {
    if (!summary) return
    setExporting(true)
    const wsData = [
      ['FinSight — Rekap Keuangan'],
      ['Bulan:', formatMonthLabel(selectedMonth)],
      [],
      ['Total Pemasukan', summary.total_income],
      ['Total Pengeluaran', summary.total_expense],
      ['Saldo Bersih', summary.net_balance],
      [],
      ['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Nominal'],
      ...transactions.map(t => [t.date, t.type === 'income' ? 'Pemasukan' : 'Pengeluaran', t.category, t.description ?? '', t.amount])
    ]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap')
    XLSX.writeFile(wb, `FinSight-Rekap-${selectedMonth}.xlsx`)
    setExporting(false)
  }

  const exportPDF = () => { window.print() }

  return (
    <AppShell>
      <div className="p-5 md:p-8 max-w-3xl mx-auto flex flex-col gap-6 print:p-0 print:max-w-full">
        {/* Header dengan Tombol Tambah */}
        <div className="flex items-center justify-between gap-3 print:hidden">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Rekap Bulanan</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.push('/transactions?action=add')}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-sm px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm">
              <Plus size={16} /> <span className="hidden sm:inline">Tambah</span>
            </button>
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 border-2 border-yellow-200 dark:border-zinc-800 rounded-xl focus:border-yellow-400 focus:outline-none dark:text-white transition-colors">
              {months.map(m => <option key={m} value={m}>{formatMonthLabel(m)}</option>)}
            </select>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block mb-4">
          <h1 className="text-2xl font-black">FinSight — Rekap Keuangan</h1>
          <p className="text-zinc-500">{formatMonthLabel(selectedMonth)}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-yellow-500" /></div>
        ) : (
          <>
            {/* Ringkasan */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Pemasukan', value: summary?.total_income ?? 0, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Pengeluaran', value: summary?.total_expense ?? 0, color: 'text-rose-500' },
                { label: 'Saldo', value: summary?.net_balance ?? 0, color: (summary?.net_balance ?? 0) >= 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-rose-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-yellow-200/80 dark:border-zinc-800 shadow-sm">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
                  <p className={`text-sm sm:text-base font-black ${color}`}>{formatRupiah(value)}</p>
                </div>
              ))}
            </div>

            {/* Rincian Kategori */}
            {Object.keys(byCategory).length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-yellow-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-yellow-100 dark:border-zinc-800/80">
                  <h3 className="font-bold text-zinc-900 dark:text-white">Rincian per Kategori</h3>
                </div>
                <ul className="divide-y divide-yellow-100/50 dark:divide-zinc-800/80">
                  {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([key, val]) => {
                    const [type, cat] = key.split('::')
                    const isIncome = type === 'income'
                    return (
                      <li key={key} className="px-5 py-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[cat] ?? '#EAB308' }} />
                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">{cat}</p>
                            <p className="text-xs text-zinc-400">{isIncome ? 'Pemasukan' : 'Pengeluaran'}</p>
                          </div>
                        </div>
                        <p className={`text-sm font-bold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                          {isIncome ? '+' : '-'}{formatRupiah(val)}
                        </p>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* Analisis AI */}
            <div className="bg-gradient-to-br from-amber-500/10 via-yellow-400/5 to-transparent dark:from-zinc-900 dark:to-zinc-900/90 rounded-2xl border border-yellow-300/60 dark:border-zinc-800 p-5 print:hidden shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-yellow-600 dark:text-yellow-400" />
                  <h3 className="font-bold text-zinc-900 dark:text-white">Analisis AI</h3>
                </div>
                <button onClick={handleAI} disabled={aiLoading}
                  className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 text-black text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm">
                  {aiLoading ? <><Loader2 size={13} className="animate-spin text-black" />Menganalisis...</> : 'Analisis Sekarang'}
                </button>
              </div>
              {aiResult ? (
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{aiResult}</p>
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Klik tombol untuk mendapatkan analisis dan saran hemat dari AI berdasarkan data bulan ini.</p>
              )}
            </div>

            {/* Tombol Ekspor */}
            <div className="flex gap-3 print:hidden">
              <button onClick={exportExcel} disabled={exporting}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-xl transition-colors shadow-sm">
                <FileSpreadsheet size={16} />
                Download Excel
              </button>
              <button onClick={exportPDF}
                className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-sm py-3 rounded-xl transition-colors shadow-sm">
                <FileText size={16} />
                Download PDF
              </button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
