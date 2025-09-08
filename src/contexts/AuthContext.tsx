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
      
      // Conforme documentação Supabase JS v2: usar signUp({ email, password, options })
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '');
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: sanitizedPassword,
        options: {
          // URL para redireciono de confirmação de email (se email confirmation estiver ativo)
          emailRedirectTo: appUrl ? `${appUrl}/envio` : undefined,
          // user_metadata
          data: {
            full_name: sanitizedName || sanitizedEmail.split('@')[0]
          }
        }
      });

      if (error) {
        console.error('❌ Erro no cadastro:', error);
        return { error };
      }

      console.log('✅ Cadastro realizado com sucesso:', data);
      
      // Verificar se o usuário foi criado
      if (data.user) {
        console.log('👤 Usuário criado:', data.user.email);
        console.log('📧 Email confirmado:', data.user.email_confirmed_at);
      }
      
      return { error: null };
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
