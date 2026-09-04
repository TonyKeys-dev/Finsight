export type ParsedTransaction = {
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
}

const incomeKeywords: [string, string][] = [
  ['gaji', 'Gaji / Upah'], ['upah', 'Gaji / Upah'], ['freelance', 'Freelance / Proyek'],
  ['proyek', 'Freelance / Proyek'], ['bisnis', 'Bisnis'], ['investasi', 'Investasi'],
]

const expenseKeywords: [string, string][] = [
  ['makan', 'Makan & Minum'], ['minum', 'Makan & Minum'], ['kopi', 'Makan & Minum'],
  ['transport', 'Transportasi'], ['bensin', 'Transportasi'], ['parkir', 'Transportasi'],
  ['belanja', 'Belanja & Kebutuhan'], ['tagihan', 'Tagihan & Utilitas'], ['listrik', 'Tagihan & Utilitas'],
  ['internet', 'Tagihan & Utilitas'], ['hiburan', 'Hiburan'], ['film', 'Hiburan'],
  ['kesehatan', 'Kesehatan'], ['obat', 'Kesehatan'], ['pendidikan', 'Pendidikan'],
  ['sekolah', 'Pendidikan'], ['tabungan', 'Tabungan & Investasi'],
]

export function parseTransaction(text: string): ParsedTransaction | null {
  const normalized = text.trim().toLocaleLowerCase('id-ID')
  const match = normalized.match(/(?:rp\.?\s*)?(\d+(?:[.,]\d+)?)(?:\s*(ribu|rb|k|juta|jt|m))?\b/i)
  if (!match) return null

  const [, rawNumber, suffix] = match
  const multiplier = suffix?.toLowerCase()
  let amount: number
  if (multiplier) {
    const value = Number(rawNumber.replace(',', '.'))
    amount = value * (['ribu', 'rb', 'k'].includes(multiplier) ? 1_000 : 1_000_000)
  } else {
    amount = Number(rawNumber.replace(/\D/g, ''))
  }
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 1_000_000_000) return null

  const isIncome = /^(masuk|income|pemasukan|terima|dapat)\b/.test(normalized) || incomeKeywords.some(([keyword]) => normalized.includes(keyword))
  const categories = isIncome ? incomeKeywords : expenseKeywords
  const category = categories.find(([keyword]) => normalized.includes(keyword))?.[1] ?? 'Lainnya'

  return { type: isIncome ? 'income' : 'expense', amount, category, description: text.trim() }
}

export function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

export function todayInJakarta() {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
  const value = (type: string) => parts.find((part) => part.type === type)?.value
  return `${value('year')}-${value('month')}-${value('day')}`
}
