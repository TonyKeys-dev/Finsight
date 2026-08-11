'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { getMonthlySummary, getTransactions } from '@/lib/actions'
import { formatRupiah, formatMonthLabel, getCurrentMonth } from '@/lib/utils'
import { CATEGORY_COLORS } from '@/types'
import type { Transaction, MonthlySummary } from '@/types'
import { TrendingUp, TrendingDown, Wallet, Sparkles, Loader2 } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'

export default function DashboardPage() {
  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const month = getCurrentMonth()

  useEffect(() => {
    Promise.all([getMonthlySummary(month), getTransactions(month)]).then(([s, t]) => {
      setSummary(s); setTransactions(t); setLoading(false)
    })
  }, [month])

  // Group expense by category for pie chart
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name, value, color: CATEGORY_COLORS[name] ?? '#EAB308'
  }))

  const recent = transactions.slice(0, 5)

  if (loading) return (
    <AppShell>
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-yellow-500" />
      </div>
    </AppShell>
  )

  return (
    <AppShell>
      <div className="p-5 md:p-8 max-w-4xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Dashboard</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">{formatMonthLabel(month)}</p>
          </div>
          <Link href="/transactions?modal=true"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-sm px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-sm">
            + Tambah
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-yellow-200/80 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950/40 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Pemasukan</span>
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatRupiah(summary?.total_income ?? 0)}</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-yellow-200/80 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-rose-100 dark:bg-rose-950/40 rounded-lg flex items-center justify-center">
                <TrendingDown size={16} className="text-rose-500" />
              </div>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Pengeluaran</span>
            </div>
            <p className="text-2xl font-black text-rose-500">{formatRupiah(summary?.total_expense ?? 0)}</p>
          </div>

          <div className={`rounded-2xl p-5 border shadow-sm transition-colors ${(summary?.net_balance ?? 0) >= 0 ? 'bg-yellow-400 border-yellow-500 text-black' : 'bg-rose-600 border-rose-700 text-white'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${(summary?.net_balance ?? 0) >= 0 ? 'bg-black/10' : 'bg-white/20'}`}>
                <Wallet size={16} className={(summary?.net_balance ?? 0) >= 0 ? 'text-black' : 'text-white'} />
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wide ${(summary?.net_balance ?? 0) >= 0 ? 'text-black/80' : 'text-white/80'}`}>Saldo Bersih</span>
            </div>
            <p className={`text-2xl font-black ${(summary?.net_balance ?? 0) >= 0 ? 'text-black' : 'text-white'}`}>{formatRupiah(summary?.net_balance ?? 0)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          {pieData.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-yellow-200/80 dark:border-zinc-800 shadow-sm">
              <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Pengeluaran per Kategori</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent + AI button */}
          <div className="flex flex-col gap-4">
            {/* AI Button */}
            <Link href="/rekap?ai=true"
              className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 rounded-2xl p-5 text-black flex items-center gap-4 hover:opacity-95 transition-all shadow-sm font-medium">
              <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} className="text-black" />
              </div>
              <div>
                <p className="font-black text-black">Analisis AI</p>
                <p className="text-xs text-black/80 font-medium">Dapatkan saran hemat dari AI</p>
              </div>
            </Link>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-yellow-200/80 dark:border-zinc-800 shadow-sm overflow-hidden flex-1">
              <div className="px-5 py-4 border-b border-yellow-100 dark:border-zinc-800/80 flex items-center justify-between">
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Transaksi Terbaru</h3>
                <Link href="/transactions" className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 hover:underline">Lihat semua</Link>
              </div>
              {recent.length === 0 ? (
                <div className="p-5 text-center text-zinc-400 text-sm">Belum ada transaksi bulan ini.</div>
              ) : (
                <ul className="divide-y divide-yellow-100/50 dark:divide-zinc-800/80">
                  {recent.map(tx => (
                    <li key={tx.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{tx.category}</p>
                        <p className="text-xs text-zinc-400">{tx.date}</p>
                      </div>
                      <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}