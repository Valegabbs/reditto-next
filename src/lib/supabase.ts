import { createClient } from '@supabase/supabase-js'

// Verificar se as variáveis de ambiente estão configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Verificando configuração do Supabase:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlValue: supabaseUrl,
  keyLength: supabaseAnonKey?.length
})

// Criar cliente Supabase
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key', 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Cliente para operações server-side
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase não configurado. Configure as variáveis de ambiente.')
  }
  
  return createClient(supabaseUrl, serviceRoleKey)
}

// Função para verificar se o Supabase está configurado e funcionando
export const isSupabaseConfigured = () => {
  // Verificar se as variáveis estão definidas
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Supabase não configurado:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlValue: supabaseUrl
    })
    return false
  }
  
  // Verificar se a URL é válida
  try {
    const url = new URL(supabaseUrl)
    if (!url.hostname.includes('supabase.co')) {
      console.log('❌ URL do Supabase inválida:', supabaseUrl)
      return false
    }
    console.log('✅ Supabase configurado corretamente:', supabaseUrl)
    return true
  } catch (error) {
    console.log('❌ Erro ao validar URL do Supabase:', error)
    return false
  }
}

// Função para testar conectividade com Supabase
export const testSupabaseConnection = async () => {
  if (!isSupabaseConfigured()) {
    return false
  }
  
  try {
    // Tentar uma operação simples para testar conectividade
    const { error } = await supabase.auth.getSession()
    return !error
  } catch {
    return false
  }
}