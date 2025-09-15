import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const { email, password, name } = body || {}

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
    }

    const admin = createClient(url, serviceKey)

    // Criar usuário com email_confirm true para dispensar verificação de email
    const { data: userData, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name || (email as string).split('@')[0] }
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    // Criar um token de sessão para este usuário (link mágico) e trocar por sessão client-side
    // Alternativa: retornar nada e o client faz signInWithPassword. Vamos optar por login direto aqui.
    const { error: signInError, data: sessionData } = await admin.auth.signInWithPassword({ email, password })
    if (signInError) {
      // Mesmo que o login direto com admin falhe (não recomendado usar admin para signIn), caímos no client login
      return NextResponse.json({ user: userData.user, requiresClientLogin: true })
    }

    return NextResponse.json({ user: sessionData.user, session: sessionData.session })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erro interno' }, { status: 500 })
  }
}

