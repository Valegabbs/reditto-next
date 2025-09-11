'use client';

import { useState, useEffect } from 'react';
import ClientWrapper from '../components/ClientWrapper';
import { ChevronLeft, FileText, Calendar, Award, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { EssayHistory } from '@/types';
import Image from 'next/image';

export default function HistoricoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [essays, setEssays] = useState<EssayHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEssayHistory() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Buscar histórico de redações do usuário
        const { data, error } = await supabase
          .from('essays')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setEssays(data as EssayHistory[]);
      } catch (err: any) {
        console.error('Erro ao buscar histórico:', err);
        setError(err.message || 'Erro ao carregar histórico de redações');
      } finally {
        setLoading(false);
      }
    }

    fetchEssayHistory();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const viewEssayDetails = (essay: EssayHistory) => {
    // Converter para o formato esperado pela página de resultados
    const resultData = {
      finalScore: essay.final_score,
      competencies: essay.competencies,
      feedback: essay.feedback,
      originalEssay: essay.essay_text
    };
    
    // Redirecionar para a página de resultados com os dados
    router.push(`/resultados?data=${encodeURIComponent(JSON.stringify(resultData))}`);
  };

  const deleteEssay = async (essayId: string) => {
    if (!user) return;
    const confirmed = window.confirm('Deseja realmente excluir esta redação? Esta ação não pode ser desfeita.');
    if (!confirmed) return;

    try {
      setDeletingId(essayId);
      // Excluir pontuações relacionadas (defensivo, caso exista tabela dependente com RLS)
      await supabase.from('essay_scores').delete().eq('user_id', user.id).eq('essay_id', essayId);
      // Excluir a redação
      const { error } = await supabase.from('essays').delete().eq('user_id', user.id).eq('id', essayId);
      if (error) throw error;
      // Atualizar estado local
      setEssays((prev) => prev.filter((e) => e.id !== essayId));
    } catch (err: any) {
      console.error('Erro ao excluir redação:', err);
      alert(err?.message || 'Não foi possível excluir a redação.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ClientWrapper showFloatingMenu={false}>
      <div className="min-h-screen bg-background">
        {/* Toggle Button - Fixed Position */}
        <button
          onClick={() => router.push('/envio')}
          className="fixed left-3 top-6 z-50 p-2 rounded-lg backdrop-blur-sm transition-colors sidebar-toggle-button"
          aria-label="Voltar para envio"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="max-w-6xl px-6 py-8 mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Histórico de Redações</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 size={32} className="animate-spin text-purple-500" />
              <span className="ml-2 text-gray-300">Carregando histórico...</span>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl border border-red-500/30 bg-red-900/20 backdrop-blur-sm">
              <p className="text-red-300">{error}</p>
            </div>
          ) : !user ? (
            <div className="p-6 rounded-2xl border border-gray-700/50 bg-gray-800/20 backdrop-blur-sm">
              <p className="text-gray-300">Faça login para visualizar seu histórico.</p>
            </div>
          ) : essays.length === 0 ? (
            <div className="p-6 rounded-2xl border border-gray-700/50 bg-gray-800/20 backdrop-blur-sm">
              <p className="text-gray-300">Você ainda não possui redações corrigidas. Envie sua primeira redação para começar!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {essays.map((essay) => (
                <div 
                  key={essay.id} 
                  className="p-6 rounded-2xl border border-gray-700/50 bg-gray-800/20 backdrop-blur-sm hover:border-purple-500/50 transition-all cursor-pointer"
                  onClick={() => viewEssayDetails(essay)}
                >
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <FileText size={18} className="text-purple-400 mr-2" />
                        <h3 className="text-xl font-semibold text-white">
                          {essay.topic || 'Redação sem tema específico'}
                        </h3>
                      </div>
                      
                      <div className="flex items-center text-gray-400 text-sm mb-3">
                        <Calendar size={14} className="mr-1" />
                        <span>{formatDate(essay.created_at)}</span>
                      </div>
                      
                      <p className="text-gray-300 line-clamp-2 mb-4">
                        {truncateText(essay.essay_text, 150)}
                      </p>
                      
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {essay.competencies && Object.entries(essay.competencies).map(([competency, score]) => (
                          <div key={competency} className="text-center">
                            <div className="text-lg font-bold text-purple-300">{score as number}</div>
                            <div className="text-xs text-gray-400">{competency.replace('Competência ', 'C')}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-center justify-center">
                      <div className="flex items-baseline gap-1">
                        <div className="text-4xl font-bold text-purple-400">{essay.final_score}</div>
                        <div className="text-xs text-gray-400">/ 1000</div>
                      </div>
                      <div className="flex items-center mt-3 -ml-2">
                        <Award size={16} className="text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-300">
                          {essay.final_score >= 900 ? "Excelente" :
                           essay.final_score >= 800 ? "Muito bom" :
                           essay.final_score >= 700 ? "Bom" :
                           essay.final_score >= 600 ? "Mediano" :
                           essay.final_score >= 400 ? "Insuficiente" : "Precário"}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); viewEssayDetails(essay); }}
                          className="flex items-center text-purple-400 text-sm hover:text-purple-300"
                        >
                          <span>Ver detalhes</span>
                          <ArrowRight size={16} className="ml-1" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); deleteEssay(essay.id); }}
                          className="flex items-center text-red-400 text-sm hover:text-red-300"
                          disabled={deletingId === essay.id}
                          aria-label="Excluir redação"
                        >
                          <Trash2 size={16} className="mr-1" />
                          {deletingId === essay.id ? 'Excluindo...' : 'Excluir redação'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-8 flex justify-center">
            <button 
              onClick={() => router.push('/envio')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium flex items-center transition-colors"
            >
              <FileText size={18} className="mr-2" />
              Nova Redação
            </button>
          </div>
        </div>
      </div>
    </ClientWrapper>
  );
}

