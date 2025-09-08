'use client';

import { useState } from 'react';
import { FileText, Image as ImageIcon, Sparkles, GraduationCap, Zap, Camera, Sun } from 'lucide-react';
import Image from 'next/image';
import ClientWrapper from '../components/ClientWrapper';
import { useAuth } from '@/contexts/AuthContext';

type SubmissionType = 'text' | 'image';

export default function EnvioPage() {
  const { user, signOut, isConfigured } = useAuth();
  const [submissionType, setSubmissionType] = useState<SubmissionType>('text');
  const [topic, setTopic] = useState('');
  const [essayText, setEssayText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Preparar payload para página de processamento
      if (submissionType === 'image' && selectedImage) {
        // Converter imagem para Data URL para transportar entre páginas
        const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });

        const dataUrl = await toDataUrl(selectedImage);
        const job = { type: 'image' as const, topic, imageDataUrl: dataUrl };
        sessionStorage.setItem('reditto-processing', JSON.stringify(job));
      } else {
        const job = { type: 'text' as const, topic, essayText };
        sessionStorage.setItem('reditto-processing', JSON.stringify(job));
      }

      // Ir para a tela de processamento
      window.location.href = '/processando';
    } catch (error) {
      console.error('❌ Erro ao preparar envio:', error);
      alert(`Erro ao preparar o processamento: ${error instanceof Error ? error.message : 'Tente novamente.'}`);
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <ClientWrapper showFloatingMenu={false}>
      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-2 header-item bg-gray-800/20 border border-gray-700/50 rounded-full px-4 py-2 backdrop-blur-sm">
              <Image src="/logo reditto.png" alt="Reditto Logo" width={20} height={20} className="w-5 h-5" />
              <span className="header-text text-white/90 text-sm font-medium">Correção de Redação para Todos!</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  const current = document.documentElement.getAttribute('data-theme') || 'dark';
                  const next = current === 'dark' ? 'light' : 'dark';
                  document.documentElement.setAttribute('data-theme', next);
                  try { localStorage.setItem('reditto-theme', next); } catch {}
                }} 
                className="text-white hover:text-yellow-400 transition-colors p-2 rounded-full hover:bg-gray-800/20 backdrop-blur-sm header-text" 
                aria-label="Alternar tema"
              >
                <Sun size={20} />
              </button>
              <button 
                onClick={handleSignOut} 
                className="header-text text-white hover:text-red-400 transition-colors flex items-center gap-1 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                </svg>
                Sair
              </button>
            </div>
          </div>

          {/* Main Content */}
          <main className="max-w-4xl mx-auto px-6 pb-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Envie sua redação</h1>
              <p className="text-gray-300 text-lg">
                Digite o tema e o texto ou envie uma foto da sua redação
              </p>
              {user && (
                <p className="text-purple-400 text-sm mt-2">
                  Olá, {user.user_metadata?.name || user.email?.split('@')[0]}! Bem-vindo ao Reditto.
                </p>
              )}
              {!isConfigured && (
                <p className="text-yellow-400 text-sm mt-2">
                  ⚠️ Modo visitante: crie uma conta para poder ter acesso ao seu histórico de redações e evoluções
                </p>
              )}
            </div>

            {/* Submission Form */}
            <div className="mb-8">
              <div className="main-form rounded-3xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Topic Field */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Tema da redação (opcional)
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex: A importância da educação digital no Brasil"
                    maxLength={200}
                    className="input-field w-full"
                  />
                  <div className="text-right text-sm text-gray-400 mt-1">
                    {topic.length}/200
                  </div>
                </div>

                {/* Submission Type Toggle */}
                <div>
                  <label className="block text-white font-medium mb-3">
                    Método de envio
                  </label>
                  <div className="flex gap-2">
                     <button
                       type="button"
                       onClick={() => setSubmissionType('text')}
                       className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl transition-all font-medium backdrop-blur-sm ${
                         submissionType === 'text'
                           ? 'toggle-button-active bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white shadow-lg'
                           : 'toggle-button-inactive bg-gray-800/30 text-gray-400 hover:bg-gray-700/40 border border-gray-600/40'
                       }`}
                     >
                       <FileText size={20} />
                       Texto
                     </button>
                     <button
                       type="button"
                       onClick={() => setSubmissionType('image')}
                       className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl transition-all font-medium backdrop-blur-sm ${
                         submissionType === 'image'
                           ? 'toggle-button-active bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white shadow-lg'
                           : 'toggle-button-inactive bg-gray-800/30 text-gray-400 hover:bg-gray-700/40 border border-gray-600/40'
                       }`}
                     >
                       <ImageIcon size={20} />
                       Imagem
                     </button>
                  </div>
                </div>

                {/* Text Input */}
                {submissionType === 'text' && (
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Texto da redação
                    </label>
                    <textarea
                      value={essayText}
                      onChange={(e) => setEssayText(e.target.value)}
                      placeholder="Cole o texto da sua redação aqui..."
                      rows={12}
                      maxLength={5000}
                      minLength={200}
                      className="input-field w-full resize-none"
                      required
                    />
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-red-400">
                        Mínimo 200 caracteres • Máximo 5.000 caracteres
                      </span>
                      <span className="text-gray-400">
                        {essayText.length}/5000
                      </span>
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                {submissionType === 'image' && (
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Foto da redação
                    </label>
                     <div className="border-2 border-dashed border-gray-600/50 rounded-2xl p-8 text-center bg-gray-800/10 backdrop-blur-sm">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        required
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-300 mb-2">
                          Clique para selecionar uma imagem
                        </p>
                        <p className="text-gray-400 text-sm">
                          PNG, JPG ou JPEG até 10MB
                        </p>
                      </label>
                    </div>
                     {selectedImage && (
                       <div className="mt-4 p-3 bg-gray-700/30 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                         <p className="text-white text-sm">
                           Arquivo selecionado: {selectedImage.name}
                         </p>
                       </div>
                     )}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || (submissionType === 'text' && essayText.length < 200) || (submissionType === 'image' && !selectedImage)}
                    className="btn-primary py-4 px-12 font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    <Sparkles size={20} />
                    {isLoading ? 'Processando...' : 'Corrigir Redação'}
                  </button>
                </div>
              </form>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card text-center">
                <GraduationCap size={48} className="mx-auto text-purple-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">5 Competências</h3>
                <p className="text-gray-300 text-sm">
                  Avaliado completo seguindo os critérios oficiais do ENEM
                </p>
              </div>
              
              <div className="card text-center">
                <Zap size={48} className="mx-auto text-purple-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">Feedback Rápido</h3>
                <p className="text-gray-300 text-sm">
                  Correção detalhada e dicas para melhorar sua escrita
                </p>
              </div>
              
              <div className="card text-center">
                <Camera size={48} className="mx-auto text-purple-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">Envio por Foto</h3>
                <p className="text-gray-300 text-sm">
                  Tire uma foto da sua redação e deixe a IA extrair o texto
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ClientWrapper>
  );
}