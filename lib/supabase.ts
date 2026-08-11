import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    if (!url || !key) throw new Error('Supabase belum dikonfigurasi.')
    _supabase = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'finsight-auth' }
    })
  }
  return _supabase
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) { return getSupabase()[prop as keyof SupabaseClient] }
})
