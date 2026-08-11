'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { getTransactions, addTransaction, deleteTransaction } from '@/lib/actions'
import { formatRupiah, formatInputRupiah, parseRupiah, getCurrentMonth } from '@/lib/utils'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types'
import type { Transaction } from '@/types'
import { Plus, Trash2, Loader2, X } from 'lucide-react'

function TransactionsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const load = useCallback(async () => {
    const data = await getTransactions(getCurrentMonth())
    setTransactions(data); setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Deteksi jika berpindah halaman membawa parameter '?action=add'
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowModal(true)
    }
  }, [searchParams])

  const handleCloseModal = () => {
    setShowModal(false)
    if (searchParams.get('action') === 'add') {
      router.replace('/transactions')
    }
  }

  const handleSave = async () => {
    const amt = parseRupiah(amount)
    if (!amt) { setError('Masukkan nominal yang valid.'); return }
    if (!category) { setError('Pilih kategori.'); return }
    setSaving(true); setError(null)
    const { error: err } = await addTransaction({ type, amount: amt, category, description, date })
    setSaving(false)
    if (err) { setError('Gagal menyimpan.'); return }
    handleCloseModal()
    setAmount(''); setCategory(''); setDescription('')
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return
    await deleteTransaction(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Transaksi</h2>
        <button onClick={() => setShowModal(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-sm px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-sm">
          <Plus size={16} /> Tambah
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-yellow-500" /></div>
      ) : transactions.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-10 text-center border border-yellow-200/80 dark:border-zinc-800 shadow-sm">
          <p className="text-zinc-500 dark:text-zinc-400">Belum ada transaksi bulan ini.</p>
          <button onClick={() => setShowModal(true)} className="mt-3 text-yellow-600 dark:text-yellow-400 text-sm font-semibold hover:underline">+ Tambah sekarang</button>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-yellow-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
          <ul className="divide-y divide-yellow-100/50 dark:divide-zinc-800/80">
            {transactions.map(tx => (
              <li key={tx.id} className="px-5 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{tx.category}</p>
                    {tx.description && <p className="text-xs text-zinc-400 truncate">{tx.description}</p>}
                    <p className="text-xs text-zinc-400">{tx.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                  </p>
                  <button onClick={() => handleDelete(tx.id)} className="text-zinc-300 hover:text-rose-500 dark:text-zinc-600 dark:hover:text-rose-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-end md:items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl border border-yellow-200/50 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">Tambah Transaksi</h3>
              <button onClick={handleCloseModal} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <X size={20} />
              </button>
            </div>

            {/* Type Toggle */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800/80 rounded-xl p-1">
              {(['expense','income'] as const).map(t => (
                <button key={t} onClick={() => { setType(t); setCategory('') }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === t ? (t === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-rose-500 text-white shadow-sm') : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {t === 'income' ? '+ Pemasukan' : '- Pengeluaran'}
                </button>
              ))}
            </div>

            {/* Nominal */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-400 dark:text-zinc-500">Rp</span>
              <input type="text" inputMode="numeric" value={amount}
                onChange={e => setAmount(formatInputRupiah(e.target.value))}
                placeholder="0"
                className="w-full pl-12 pr-4 py-4 text-2xl font-black text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800/80 border-2 border-yellow-200 dark:border-zinc-700 rounded-2xl focus:border-yellow-400 focus:outline-none transition-colors" />
            </div>

            {/* Kategori */}
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800/80 border-2 border-yellow-200 dark:border-zinc-700 rounded-xl focus:border-yellow-400 focus:outline-none dark:text-white transition-colors">
              <option value="">Pilih kategori...</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Catatan */}
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Catatan (opsional)"
              className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800/80 border-2 border-yellow-200 dark:border-zinc-700 rounded-xl focus:border-yellow-400 focus:outline-none dark:text-white transition-colors" />

            {/* Tanggal */}
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800/80 border-2 border-yellow-200 dark:border-zinc-700 rounded-xl focus:border-yellow-400 focus:outline-none dark:text-white transition-colors" />

            {error && <p className="text-rose-500 text-sm font-medium text-center">{error}</p>}

            <button onClick={handleSave} disabled={saving}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 text-black font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-sm">
              {saving ? <><Loader2 size={18} className="animate-spin text-black" />Menyimpan...</> : 'Simpan'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TransactionsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-yellow-500" /></div>}>
        <TransactionsContent />
      </Suspense>
    </AppShell>
  )
}