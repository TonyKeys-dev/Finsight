import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { formatRupiah, parseTransaction, todayInJakarta } from '@/lib/whatsapp'

export const runtime = 'nodejs'

type IncomingMessage = { id: string; from: string; type: string; text?: { body?: string } }

function config() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const graphVersion = process.env.WHATSAPP_GRAPH_API_VERSION
  const missing = [!token && 'WHATSAPP_ACCESS_TOKEN', !phoneNumberId && 'WHATSAPP_PHONE_NUMBER_ID', !graphVersion && 'WHATSAPP_GRAPH_API_VERSION'].filter(Boolean)
  if (missing.length) throw new Error(`WhatsApp belum dikonfigurasi: ${missing.join(', ')}`)
  return { token, phoneNumberId, graphVersion }
}

function validSignature(body: string, signature: string | null) {
  const secret = process.env.WHATSAPP_APP_SECRET
  if (!secret || !signature?.startsWith('sha256=')) return false
  const expected = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`
  return expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

async function sendText(to: string, body: string) {
  const { token, phoneNumberId, graphVersion } = config()
  const response = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }),
  })
  if (!response.ok) throw new Error(`WhatsApp send failed: ${response.status} ${await response.text()}`)
}

async function handleMessage(message: IncomingMessage) {
  if (message.type !== 'text' || !message.text?.body) return
  const admin = getSupabaseAdmin()
  const { error: dedupeError } = await admin.from('whatsapp_processed_messages').insert({ message_id: message.id })
  if (dedupeError) return // pesan Meta bisa dikirim ulang; cukup proses sekali

  const phone = message.from
  const text = message.text.body.trim()
  const command = text.toLocaleLowerCase('id-ID')

  const linkMatch = command.match(/^(?:hubungkan|link)\s+([a-z0-9]{8})$/i)
  if (linkMatch) {
    const { data: link } = await admin.from('whatsapp_links').select('user_id, link_code_expires_at').eq('link_code', linkMatch[1].toUpperCase()).maybeSingle()
    if (!link || new Date(link.link_code_expires_at ?? 0) < new Date()) {
      await sendText(phone, 'Kode tidak valid atau sudah kedaluwarsa. Buat kode baru dari Pengaturan FinSight.')
      return
    }
    const { error } = await admin.from('whatsapp_links').update({ phone_number: phone, link_code: null, link_code_expires_at: null, linked_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('user_id', link.user_id)
    await sendText(phone, error ? 'Gagal menghubungkan WhatsApp. Coba lagi.' : 'WhatsApp berhasil terhubung ke FinSight. Kirim contoh: makan 25 ribu')
    return
  }

  const { data: link } = await admin.from('whatsapp_links').select('user_id').eq('phone_number', phone).maybeSingle()
  if (!link) {
    await sendText(phone, 'Nomor ini belum terhubung. Buka Pengaturan FinSight, buat kode, lalu kirim: HUBUNGKAN KODE.')
    return
  }

  if (/^(ya|iya|y|konfirmasi)$/i.test(command)) {
    const { data: pending } = await admin.from('whatsapp_pending_transactions').select('*').eq('phone_number', phone).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (!pending) {
      await sendText(phone, 'Tidak ada transaksi yang menunggu konfirmasi. Kirim contoh: makan 25 ribu')
      return
    }
    const { error } = await admin.from('transactions').insert({ user_id: pending.user_id, type: pending.type, amount: pending.amount, category: pending.category, description: pending.description, date: pending.transaction_date })
    if (!error) await admin.from('whatsapp_pending_transactions').delete().eq('id', pending.id)
    await sendText(phone, error ? 'Transaksi belum tersimpan. Coba balas YA lagi.' : `Tersimpan: ${pending.type === 'income' ? 'pemasukan' : 'pengeluaran'} ${pending.category} ${formatRupiah(Number(pending.amount))}.`)
    return
  }

  if (/^(tidak|batal|n|no)$/i.test(command)) {
    await admin.from('whatsapp_pending_transactions').delete().eq('phone_number', phone)
    await sendText(phone, 'Dibatalkan. Tidak ada transaksi yang disimpan.')
    return
  }

  const parsed = parseTransaction(text)
  if (!parsed) {
    await sendText(phone, 'Saya belum memahami pesannya. Contoh: makan 25 ribu, bensin 50rb, atau masuk gaji 5 juta.')
    return
  }
  await admin.from('whatsapp_pending_transactions').delete().eq('phone_number', phone)
  const { error } = await admin.from('whatsapp_pending_transactions').insert({
    user_id: link.user_id, phone_number: phone, type: parsed.type, amount: parsed.amount, category: parsed.category,
    description: parsed.description, transaction_date: todayInJakarta(), source_message_id: message.id,
  })
  if (error) throw error
  await sendText(phone, `Catat ${parsed.type === 'income' ? 'pemasukan' : 'pengeluaran'} ${parsed.category} sebesar ${formatRupiah(parsed.amount)} hari ini? Balas YA untuk simpan atau TIDAK untuk batal.`)
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  if (params.get('hub.mode') === 'subscribe' && params.get('hub.verify_token') === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(params.get('hub.challenge') ?? '', { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  if (!validSignature(rawBody, request.headers.get('x-hub-signature-256'))) {
    console.warn('WhatsApp webhook rejected: signature tidak valid atau WHATSAPP_APP_SECRET belum disetel.')
    return new NextResponse('Invalid signature', { status: 401 })
  }
  try {
    const body = JSON.parse(rawBody) as { entry?: { changes?: { value?: { messages?: IncomingMessage[] } }[] }[] }
    const messages = body.entry?.flatMap((entry) => entry.changes?.flatMap((change) => change.value?.messages ?? []) ?? []) ?? []
    for (const message of messages) await handleMessage(message)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('WhatsApp webhook error', error)
    return new NextResponse('Webhook processing failed', { status: 500 })
  }
}
