'use client';

import { useState } from 'react';
import { Sun, Users, Mail, Eye, EyeOff, User } from 'lucide-react';
import Image from 'next/image';
import ClientWrapper from './components/ClientWrapper';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { signUp, signIn, loading, isConfigured, user, session } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ type, message });
    try {
      window.clearTimeout((window as any).__reditto_toast_timer);
    } catch {}
    (window as any).__reditto_toast_timer = window.setTimeout(() => setToast(null), 4000);
  };

  const handleThemeToggle = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('reditto-theme', next); } catch {}
    setIsDarkMode(next === 'dark');
  };

  const handleCreateAccount = () => {
    setShowLogin(true);
    setIsLogin(false);
  };

  const handleEmailLogin = () => {
    setShowLogin(true);
    setIsLogin(true);
  };

  const handleGuestAccess = () => {
    // Redirecionar para a página de envio como visitante
    window.location.href = '/envio';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(formData.email, formData.password);
      } else {
        result = await signUp(formData.email, formData.password, formData.name);
      }

      if (result.error) {
        showToast(`Erro: ${result.error.message || 'Tente novamente.'}`, 'error');
        setIsSubmitting(false);
        return;
      }

      // Aguardar um pouco para a autenticação ser processada
      console.log('⏳ Aguardando autenticação...');
      
      // Aguardar até 5 segundos pela autenticação
      let attempts = 0;
      const maxAttempts = 50; // 5 segundos com verificações a cada 100ms
      
      const checkAuth = () => {
        attempts++;
        console.log(`Tentativa ${attempts}/${maxAttempts} - User: ${user ? 'Sim' : 'Não'}, Session: ${session ? 'Sim' : 'Não'}`);
        
        if (user && session) {
          console.log('✅ Usuário autenticado, redirecionando...');
          window.location.href = '/envio';
        } else if (attempts >= maxAttempts) {
          console.log('⚠️ Timeout na autenticação, mas redirecionando mesmo assim...');
          window.location.href = '/envio';
        } else {
          setTimeout(checkAuth, 100);
        }
      };
      
      checkAuth();
      
    } catch (error) {
      console.error('Erro no formulário:', error);
      showToast('Erro inesperado. Tente novamente.', 'error');
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <ClientWrapper showFloatingMenu={false}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white">Carregando...</p>
          </div>
        </div>
      </ClientWrapper>
    );
  }

  return (
    <ClientWrapper showFloatingMenu={false}>
      <div className="min-h-screen bg-background">
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 z-50">
            <div className={`px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm ${
              toast.type === 'error' ? 'bg-red-900/30 border-red-500/40 text-red-200' : toast.type === 'success' ? 'bg-green-900/30 border-green-500/40 text-green-200' : 'bg-yellow-900/30 border-yellow-500/40 text-yellow-200'
            }`}>
              <div className="flex items-start gap-3">
                <span className="font-medium">{toast.type === 'error' ? 'Aviso' : toast.type === 'success' ? 'Sucesso' : 'Informação'}</span>
                <button onClick={() => setToast(null)} className="ml-auto text-white/70 hover:text-white">✕</button>
              </div>
              <div className="text-sm mt-1">{toast.message}</div>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between p-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 header-item bg-gray-800/20 border border-gray-700/50 rounded-full px-4 py-2 backdrop-blur-sm">
            <Image src="/logo reditto.png" alt="Reditto Logo" width={20} height={20} className="w-5 h-5" />
            <span className="header-text text-white/90 text-sm font-medium">Correção de Redação para Todos!</span>
          </div>
          <button 
            onClick={handleThemeToggle} 
            className="text-white hover:text-yellow-400 transition-colors p-2 rounded-full hover:bg-gray-800/20 backdrop-blur-sm header-text" 
            aria-label="Alternar tema"
          >
            <Sun size={20} />
          </button>
        </div>

        {/* Main Content */}
        <main className="max-w-md mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <Image src="/logo reditto.png" alt="Reditto Logo" width={80} height={80} className="mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo ao Reditto</h1>
            <p className="text-gray-300">
              Sua plataforma inteligente para correção de redações
            </p>
            
            {!isConfigured && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
                <p className="text-red-400 text-sm">
                  ❌ <strong>Erro de Configuração:</strong> Sistema de autenticação não está funcionando. Entre em contato com o suporte.
                </p>
              </div>
            )}
          </div>

          {!showLogin ? (
            <>
              {/* Botões de Conta */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleCreateAccount}
                  disabled={!isConfigured}
                  className={`w-full btn-secondary ${!isConfigured ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Users size={20} />
                  Criar conta
                </button>
                <button
                  onClick={handleEmailLogin}
                  disabled={!isConfigured}
                  className={`w-full btn-secondary ${!isConfigured ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Mail size={20} />
                  Entrar com Email
                </button>
              </div>

              {/* Seção de Visitante */}
              <div className="main-form rounded-2xl p-4">
                <h3 className="text-white font-medium mb-1 text-center">Testar sem cadastro</h3>
                <p className="text-gray-300 text-sm mb-3 text-center">
                  Experimente todas as funcionalidades
                </p>
                <p className="text-yellow-400 text-xs mb-3 text-center">
                  ⚠️ Modo visitante: crie uma conta para poder ter acesso ao seu histórico de redações e evoluções
                </p>
                <button
                  onClick={handleGuestAccess}
                  className="w-full btn-secondary justify-center"
                >
                  <User size={20} />
                  Entrar como visitante
                </button>
              </div>
            </>
          ) : (
            /* Formulário de Login/Registro */
            <div className="main-form rounded-2xl p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isLogin ? 'Entrar' : 'Criar Conta'}
                </h2>
                <p className="text-gray-300 text-sm">
                  {isLogin ? 'Acesse sua conta' : 'Crie sua conta gratuita'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Seu nome completo"
                      className="input-field w-full"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-white font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    className="input-field w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Sua senha"
                      className="input-field w-full pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-3 font-semibold flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {isLogin ? 'Entrando...' : 'Criando conta...'}
                    </>
                  ) : (
                    <>
                      <Mail size={20} />
                      {isLogin ? 'Entrar' : 'Criar Conta'}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setShowLogin(false);
                    setFormData({ email: '', password: '', name: '' });
                  }}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ← Voltar
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </ClientWrapper>
  );
}