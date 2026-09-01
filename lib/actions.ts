import { supabase } from './supabase'
import { getCurrentMonth } from './utils'
import type { Transaction, MonthlySummary } from '@/types'

// ── Transactions ──────────────────────────────────────────

export async function addTransaction(data: {
  type: 'income' | 'expense'
  amount: number
  category: string
  description?: string
  date: string
}): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('transactions').insert({
    ...data,
    user_id: user?.id,
    description: data.description || null,
  })
  return { error: error?.message ?? null }
}

export async function getTransactions(month?: string): Promise<Transaction[]> {
  const { data: { user } } = await supabase.auth.getUser()
  const m = month ?? getCurrentMonth()
  const [year, mon] = m.split('-').map(Number)
  const lastDay = new Date(year, mon, 0).getDate()
  const start = `${m}-01`
  const end = `${m}-${String(lastDay).padStart(2, '0')}`
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user?.id)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return []
  return data ?? []
}

export async function deleteTransaction(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  return { error: error?.message ?? null }
}

export async function updateTransaction(id: string, data: Partial<Transaction>): Promise<{ error: string | null }> {
  const { error } = await supabase.from('transactions').update(data).eq('id', id)
  return { error: error?.message ?? null }
}

// ── Monthly Summary ───────────────────────────────────────

export async function getMonthlySummary(month?: string): Promise<MonthlySummary> {
  const { data: { user } } = await supabase.auth.getUser()
  const m = month ?? getCurrentMonth()
  const [year, mon] = m.split('-').map(Number)
  const lastDay = new Date(year, mon, 0).getDate()
  const start = `${m}-01`
  const end = `${m}-${String(lastDay).padStart(2, '0')}`

  const { data } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', user?.id)
    .gte('date', start)
    .lte('date', end)

  const rows = data ?? []
  const total_income = rows.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  const total_expense = rows.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)

  return { month: m, total_income, total_expense, net_balance: total_income - total_expense }
}

export async function getAvailableMonths(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase
    .from('transactions')
    .select('date')
    .eq('user_id', user?.id)
    .order('date', { ascending: false })

  if (!data) return []
  const months = [...new Set(data.map(r => r.date.slice(0, 7)))]
  return months
}
