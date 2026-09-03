import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
const MAX_BODY_SIZE = 2_000

type Transaction = { type: 'income' | 'expense'; category: string; amount: number }

export async function POST(req: NextRequest) {
  try {
    const contentLength = Number(req.headers.get('content-length') ?? 0)
    if (contentLength > MAX_BODY_SIZE) return NextResponse.json({ error: 'Permintaan terlalu besar.' }, { status: 413 })

    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!token || !url || !anonKey) return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 })

    const supabase = createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } })
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 })

    const body: unknown = await req.json()
    const month = typeof (body as { month?: unknown }).month === 'string' ? (body as { month: string }).month : ''
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return NextResponse.json({ error: 'Bulan tidak valid.' }, { status: 400 })

    const [year, mon] = month.split('-').map(Number)
    const start = `${month}-01`
    const end = `${month}-${String(new Date(year, mon, 0).getDate()).padStart(2, '0')}`
    const { data, error: dataError } = await supabase.from('transactions').select('type, category, amount').eq('user_id', user.id).gte('date', start).lte('date', end)
    if (dataError) return NextResponse.json({ error: 'Gagal memuat data transaksi.' }, { status: 500 })
    const transactions = (data ?? []) as Transaction[]
    const total_income = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const total_expense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const summary = { total_income, total_expense, net_balance: total_income - total_expense }
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const expenseList = transactions
      .filter((t: { type: string; category: string; amount: number }) => t.type === 'expense')
      .map((t: { category: string; amount: number }) => `- ${t.category}: Rp ${t.amount.toLocaleString('id-ID')}`)
      .join('\n')

    const prompt = `Kamu adalah teman yang jago soal keuangan. Ngobrol santai, pakai bahasa sehari-hari, kayak lagi chat sama teman — bukan konsultan keuangan formal.

Data keuangan bulan ${month}:
- Pemasukan: Rp ${summary.total_income.toLocaleString('id-ID')}
- Pengeluaran: Rp ${summary.total_expense.toLocaleString('id-ID')}
- Saldo: Rp ${summary.net_balance.toLocaleString('id-ID')}

Pengeluaran per kategori:
${expenseList || '(Belum ada pengeluaran)'}

Kasih komentar singkat (2-3 paragraf pendek) yang isinya:
1. Gimana kondisi keuangan bulan ini — jujur tapi tidak menghakimi
2. Satu atau dua hal yang bisa dihemat — spesifik dan realistis
3. Semangat singkat buat bulan depan

Gaya bahasa: santai, singkat, pakai "kamu", boleh pakai kata-kata kayak "btw", "nah", "lumayan", dll. Tulis dalam paragraf, bukan poin-poin.`

    const completion = await groq.chat.completions.create({
      // Dapat dioverride lewat environment variable saat kebutuhan model berubah.
      model: process.env.GROQ_MODEL ?? 'groq/compound-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.7,
    })

    return NextResponse.json({ result: completion.choices[0].message.content })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal menghubungi AI.' }, { status: 500 })
  }
}
