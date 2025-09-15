'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, testSupabaseConnection } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const checkSupabase = async () => {
      const configured = isSupabaseConfigured();
      
      if (!configured) {
        console.warn('⚠️ Supabase não configurado. Funcionando em modo visitante.');
        setIsConfigured(false);
        setLoading(false);
        return;
      }

      // Testar conectividade
      const isConnected = await testSupabaseConnection();
      
      if (!isConnected) {
        console.warn('⚠️ Supabase configurado mas não conectado. Funcionando em modo visitante.');
        setIsConfigured(false);
        setLoading(false);
        return;
      }

      setIsConfigured(true);

      // Obter sessão inicial
      const getInitialSession = async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Erro ao obter sessão:', error);
          } else {
            setSession(session);
            setUser(session?.user ?? null);
          }
        } catch (error) {
          console.error('Erro ao conectar com Supabase:', error);
        }
        setLoading(false);
      };

      getInitialSession();

      // Escutar mudanças de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    };

    checkSupabase();
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    if (!isConfigured) {
      console.error('❌ Supabase não configurado. Não é possível criar conta.');
      return { error: { message: 'Sistema não configurado. Entre em contato com o suporte.' } };
    }

    try {
      const sanitizedEmail = (email || '').trim().toLowerCase();
      const sanitizedName = (name || '').trim();
      const sanitizedPassword = (password || '').trim();

      // Boas práticas: validar antes de enviar à API
      if (!sanitizedEmail || !sanitizedPassword) {
        return { error: { message: 'Informe email e senha.' } };
      }
      if (sanitizedPassword.length < 8) {
        return { error: { message: 'A senha deve ter pelo menos 8 caracteres.' } };
      }

      console.log('🔄 Tentando criar conta para:', sanitizedEmail);
      console.log('📝 Dados do cadastro:', { email: sanitizedEmail, name: sanitizedName, passwordLength: sanitizedPassword.length });

      // Usar endpoint server-side para criar usuário com email_confirm sem verificação
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword, name: sanitizedName })
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Falha no cadastro' }))
        console.error('❌ Erro no cadastro (server):', err)
        return { error: { message: err.error || 'Falha ao criar conta' } }
      }

      const result = await response.json()

      // Se o servidor já retornou sessão, persistir no cliente
      if (result?.session?.access_token) {
        // Define a sessão no cliente para manter o login
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        })
        if (setSessionError) {
          console.warn('⚠️ Falha ao definir sessão diretamente, tentando login com senha...', setSessionError)
        }
      }

      // Caso não tenha sessão, faz login com senha normalmente
      if (!result?.session) {
        await supabase.auth.signInWithPassword({ email: sanitizedEmail, password: sanitizedPassword })
      }

      return { error: null }
    } catch (error) {
      console.error('❌ Erro inesperado no cadastro:', error);
      return { error: { message: 'Erro inesperado. Tente novamente.' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      console.error('❌ Supabase não configurado. Não é possível fazer login.');
      return { error: { message: 'Sistema não configurado. Entre em contato com o suporte.' } };
    }

    try {
      console.log('🔄 Tentando fazer login para:', email);
      console.log('🔑 Dados do login:', { email, passwordLength: password.length });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        return { error };
      }

      console.log('✅ Login realizado com sucesso:', data);
      
      // Verificar se a sessão foi criada
      if (data.session) {
        console.log('🔐 Sessão criada:', data.session.access_token ? 'Sim' : 'Não');
        console.log('👤 Usuário logado:', data.user?.email);
      }
      
      return { error: null };
    } catch (error) {
      console.error('❌ Erro inesperado no login:', error);
      return { error: { message: 'Erro inesperado. Tente novamente.' } };
    }
  };

  const signOut = async () => {
    if (!isConfigured) {
      setUser(null);
      setSession(null);
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao sair:', error);
      } else {
        console.log('Logout realizado');
      }
    } catch (error) {
      console.error('Erro inesperado no logout:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
