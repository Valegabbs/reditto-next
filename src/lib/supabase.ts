import { createClient } from '@supabase/supabase-js'

// Nunca deixar valores reais hardcoded. Exigir env vars.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Mensagem sucinta sem expor valores
  // eslint-disable-next-line no-console
  console.warn('Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.')
}

// Cliente para uso no browser. RLS garante segurança.
export const supabase = createClient(
  supabaseUrl || 'http://localhost',
  supabaseAnonKey || 'anon-key-missing',
  {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
  }
)

// Cliente para uso em scripts server-side (evitar usar no browser)
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase não configurado no servidor.')
  }
  return createClient(supabaseUrl, serviceRoleKey)
}

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey)

export const testSupabaseConnection = async () => {
  if (!isSupabaseConfigured()) return false
  try {
    const { error } = await supabase.auth.getSession()
    if (error) return false
    return true
  } catch {
    return false
  }
}