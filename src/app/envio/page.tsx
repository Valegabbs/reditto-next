'use client';

import { useState } from 'react';
import { FileText, Image as ImageIcon, Sparkles, GraduationCap, Zap, Camera, Sun } from 'lucide-react';
import Image from 'next/image';
import FrameLoadingOverlay from '@/components/FrameLoadingOverlay';
import ClientWrapper from '../components/ClientWrapper';
import Disclaimer from '../components/Disclaimer';
import Sidebar from '../components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

type SubmissionType = 'text' | 'image';

export default function EnvioPage() {
  const { user, signOut, isConfigured } = useAuth();
  const router = useRouter();
  const [submissionType, setSubmissionType] = useState<SubmissionType>('text');
  const [topic, setTopic] = useState('');
  const [essayText, setEssayText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Sidebar e navegação agora são geridos pelo componente Sidebar persistente

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
      // Processar inline sem página de processamento
      let finalEssayText: string = ''
      if (submissionType === 'image' && selectedImage) {
        const ocrFormData = new FormData();
        ocrFormData.append('image', selectedImage);
        const ocrResponse = await fetch('/api/extract-text', { method: 'POST', body: ocrFormData });
        if (!ocrResponse.ok) {
          const errorData = await ocrResponse.json().catch(() => ({ error: 'Erro no OCR' }));
          throw new Error(errorData.error || 'Falha ao extrair texto da imagem');
        }
        const ocrResult = await ocrResponse.json();
        finalEssayText = ocrResult.extractedText as string;
      } else {
        finalEssayText = essayText;
      }

      const correctionFormData = new FormData();
      correctionFormData.append('topic', topic || '');
      correctionFormData.append('essayText', finalEssayText || '');
      const response = await fetch('/api/correct-essay', { method: 'POST', body: correctionFormData });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || 'Falha ao processar a redação');
      }
      const result = await response.json();
      // Encerrar animação antes de redirecionar
      setIsLoading(false);
      // Redirecionar diretamente para a página de resultados
      window.location.href = `/resultados?data=${encodeURIComponent(JSON.stringify(result))}`;
    } catch (error) {
      console.error('❌ Erro ao preparar envio:', error);
      window.dispatchEvent(new CustomEvent('reditto:toast', { detail: { message: `Erro ao preparar o processamento: ${error instanceof Error ? error.message : 'Tente novamente.'}`, type: 'error' } }));
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <ClientWrapper showFloatingMenu={false}>
      <FrameLoadingOverlay visible={isLoading} />
      <div className="min-h-screen bg-background bg-dot-grid">
        <div className="flex">
          <Sidebar />

          {/* Main Content */}
          <div className="w-full">
          {/* Header */}
          <div className="flex items-center p-6">
            {/* Esconde logo e slogan no mobile (onde existe o menu hambúrguer) */}
              <div className="hidden md:flex gap-3 items-center ml-4 header-item">
              <Image src="/assets/logo.PNG" alt="Reditto Logo" width={36} height={36} className="w-9 h-9" />
              <span className="text-base font-medium header-text text-white/90">Correção de Redação para Todos!</span>
            </div>
            <div className="ml-auto flex gap-3 items-center">
              <button 
                onClick={() => {
                  const current = document.documentElement.getAttribute('data-theme') || 'dark';
                  const next = current === 'dark' ? 'light' : 'dark';
                  document.documentElement.setAttribute('data-theme', next);
                  try { localStorage.setItem('reditto-theme', next); } catch {}
                }} 
                className="p-2 text-white rounded-full backdrop-blur-sm transition-colors hover:text-yellow-400 hover:bg-gray-800/20 header-text" 
                aria-label="Alternar tema"
              >
                <Sun size={20} />
              </button>
              <button 
                onClick={handleSignOut} 
                className="flex gap-1 items-center text-sm text-white transition-colors header-text hover:text-red-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                </svg>
                Sair
              </button>
            </div>
          </div>

          {/* Main Content */}
          <main className="px-6 pb-6 mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-4xl font-bold text-white">Envie sua redação</h1>
              <p className="text-lg text-gray-300">
                Digite o tema e o texto ou envie uma foto da sua redação
              </p>
              {user && (
                <p className="mt-2 text-sm text-purple-400">
                  Olá, {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]}! Bem-vindo ao Reditto.
                </p>
              )}
              {!isConfigured && (
                <p className="mt-2 text-sm text-yellow-400">
                  ⚠️ Modo visitante: crie uma conta para poder ter acesso ao seu histórico de redações e evoluções
                </p>
              )}
            </div>

            {/* Submission Form */}
            <div className="mb-8">
              <div className="p-8 rounded-3xl main-form">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Topic Field */}
                <div>
                  <label className="block mb-2 font-medium text-white">
                    Tema da redação (opcional)
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex: A importância da educação digital no Brasil"
                    maxLength={200}
                    className="w-full input-field"
                  />
                  <div className="mt-1 text-sm text-right text-gray-400">
                    {topic.length}/200
                  </div>
                </div>

                {/* Submission Type Toggle */}
                <div>
                  <label className="block mb-3 font-medium text-white">
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
                    <label className="block mb-2 font-medium text-white">
                      Texto da redação
                    </label>
                    <textarea
                      value={essayText}
                      onChange={(e) => setEssayText(e.target.value)}
                      placeholder="Cole o texto da sua redação aqui..."
                      rows={12}
                      maxLength={5000}
                      minLength={200}
                      className="w-full resize-none input-field"
                      required
                    />
                    <div className="flex justify-between mt-1 text-sm">
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
                    <label className="block mb-2 font-medium text-white">
                      Foto da redação
                    </label>
                     <div className="p-8 text-center rounded-2xl border-2 border-dashed backdrop-blur-sm border-gray-600/50 bg-gray-800/10">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        required
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
                        <p className="mb-2 text-gray-300">
                          Clique para selecionar uma imagem
                        </p>
                        <p className="text-sm text-gray-400">
                          PNG, JPG ou JPEG até 10MB
                        </p>
                      </label>
                    </div>
                     {selectedImage && (
                       <div className="p-3 mt-4 rounded-2xl border backdrop-blur-sm bg-gray-700/30 border-gray-700/50">
                         <p className="text-sm text-white">
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
                    className="flex gap-3 justify-center items-center px-12 py-4 font-semibold shadow-lg transform btn-primary hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  >
                    <Sparkles size={20} />
                    {isLoading ? 'Processando...' : 'Corrigir Redação'}
                  </button>
                </div>
              </form>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center card">
                <GraduationCap size={48} className="mx-auto mb-4 text-purple-400" />
                <h3 className="mb-2 font-semibold text-white">5 Competências</h3>
                <p className="text-sm text-gray-300">
                  Avaliado completo seguindo os critérios oficiais do ENEM
                </p>
              </div>
              
              <div className="text-center card">
                <Zap size={48} className="mx-auto mb-4 text-purple-400" />
                <h3 className="mb-2 font-semibold text-white">Feedback Rápido</h3>
                <p className="text-sm text-gray-300">
                  Correção detalhada e dicas para melhorar sua escrita
                </p>
              </div>
              
              <div className="text-center card">
                <Camera size={48} className="mx-auto mb-4 text-purple-400" />
                <h3 className="mb-2 font-semibold text-white">Envio por Foto</h3>
                <p className="text-sm text-gray-300">
                  Tire uma foto da sua redação e deixe a IA extrair o texto
                </p>
              </div>
            </div>
          </main>
          <Disclaimer />
          </div>
        </div>
      </div>
    </ClientWrapper>
  );
}