'use client';

import { useState } from 'react';
import { Sun, Users, Mail, Eye, EyeOff, User } from 'lucide-react';
import Image from 'next/image';
import ClientWrapper from './components/ClientWrapper';

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode adicionar lógica de autenticação
    // Por enquanto, vamos apenas redirecionar para a página de envio
    window.location.href = '/envio';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <ClientWrapper showFloatingMenu={false}>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo reditto.png"
              alt="Reditto Logo"
              width={80}
              height={80}
              className="w-20 h-20"
            />
          </div>
          <p className="text-gray-300 text-lg">Correção de Redação para Todos!</p>
        </div>

        {/* Seletor de Tema */}
        <div className="main-form rounded-2xl p-4 mb-6 flex items-center gap-3">
          <button
            onClick={handleThemeToggle}
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <Sun size={20} />
          </button>
          <span className="text-gray-300 text-sm">
            Clique no ícone para alterar a cor do seu ambiente.
          </span>
        </div>

        {!showLogin ? (
          <>
            {/* Botões de Conta */}
            <div className="space-y-3 mb-6">
              <button
                onClick={handleCreateAccount}
                className="w-full btn-secondary"
              >
                <Users size={20} />
                Criar conta
              </button>
              <button
                onClick={handleEmailLogin}
                className="w-full btn-secondary"
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
            <h2 className="text-white text-xl font-semibold mb-4 text-center">
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nome completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/20 border border-gray-700/50 text-white placeholder-gray-400 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm transition-all duration-200"
                    required
                  />
                </div>
              )}
              
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800/20 border border-gray-700/50 text-white placeholder-gray-400 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm transition-all duration-200"
                  required
                />
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800/20 border border-gray-700/50 text-white placeholder-gray-400 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              <button
                type="submit"
                className="w-full btn-primary"
              >
                {isLogin ? 'Entrar' : 'Criar Conta'}
              </button>
            </form>
            
            <button
              onClick={() => setShowLogin(false)}
              className="w-full text-gray-400 hover:text-white text-sm mt-4"
            >
              Voltar
            </button>
          </div>
        )}
        </div>
    </div>
    </ClientWrapper>
  );
}
