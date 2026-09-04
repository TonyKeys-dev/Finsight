import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

function createCode() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!token || !url || !anonKey) return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 })

    const auth = createClient(url, anonKey)
    const { data: { user }, error } = await auth.auth.getUser(token)
    if (error || !user) return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 })

    const code = createCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    const admin = getSupabaseAdmin()
    const { error: saveError } = await admin.from('whatsapp_links').upsert({
      user_id: user.id,
      link_code: code,
      link_code_expires_at: expiresAt,
      phone_number: null,
      linked_at: null,
      updated_at: new Date().toISOString(),
    })
    if (saveError) throw saveError
    return NextResponse.json({ code, expiresAt })
  } catch (error) {
    console.error('WhatsApp link code error', error)
    return NextResponse.json({ error: 'Gagal membuat kode penghubung.' }, { status: 500 })
  }
}
