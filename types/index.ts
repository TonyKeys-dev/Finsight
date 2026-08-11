export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  category: string
  description: string | null
  date: string
  created_at: string
}

export interface MonthlySummary {
  month: string
  total_income: number
  total_expense: number
  net_balance: number
}

export const INCOME_CATEGORIES = ['Gaji / Upah','Freelance / Proyek','Bisnis','Investasi','Lainnya']
export const EXPENSE_CATEGORIES = ['Makan & Minum','Transportasi','Belanja & Kebutuhan','Tagihan & Utilitas','Hiburan','Kesehatan','Pendidikan','Tabungan & Investasi','Lainnya']

export const CATEGORY_COLORS: Record<string, string> = {
  'Makan & Minum': '#F97316',
  'Transportasi': '#3B82F6',
  'Belanja & Kebutuhan': '#8B5CF6',
  'Tagihan & Utilitas': '#EF4444',
  'Hiburan': '#EC4899',
  'Kesehatan': '#14B8A6',
  'Pendidikan': '#F59E0B',
  'Tabungan & Investasi': '#10B981',
  'Lainnya': '#6B7280',
  'Gaji / Upah': '#22C55E',
  'Freelance / Proyek': '#06B6D4',
  'Bisnis': '#84CC16',
  'Investasi': '#A855F7',
}
