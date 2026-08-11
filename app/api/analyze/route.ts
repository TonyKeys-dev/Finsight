import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export async function POST(req: NextRequest) {
  try {
    const { transactions, summary, month } = await req.json()
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
      model: 'llama-3.1-8b-instant',
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
