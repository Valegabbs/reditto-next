'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, CheckCircle, AlertTriangle, Lightbulb, Printer, Brain, Award, TrendingUp, Target, Sun } from 'lucide-react';
import Image from 'next/image';
import ClientWrapper from '../components/ClientWrapper';
import Disclaimer from '../components/Disclaimer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ResultadosPage() {
  const [result, setResult] = useState<any>(null);
  const { signOut, user, isConfigured } = useAuth();
  const savedRef = useRef(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    
    if (dataParam) {
      // Dados vindos da API de correção
      try {
        const parsedData = JSON.parse(decodeURIComponent(dataParam));
        setResult(parsedData);
      } catch (error) {
        console.error('Erro ao parsear dados:', error);
        // Fallback para dados de exemplo
        setResult(getExampleData());
      }
    } else {
      // Sem parâmetros: mostrar dados de exemplo
      setResult(getExampleData());
    }
  }, []);

  // Salvar automaticamente a redação no histórico do usuário autenticado
  useEffect(() => {
    if (!result || !user || !isConfigured) return;

    // Evitar múltiplas execuções causadas por re-renders
    if (savedRef.current) return;
    savedRef.current = true;

    (async () => {
      try {
        const record = {
          user_id: user.id,
          topic: (result.topic as string) || null,
          essay_text: (result.originalEssay as string) || '',
          final_score: (result.finalScore as number) ?? null,
          competencies: result.competencies ? JSON.stringify(result.competencies) : null,
          feedback: result.feedback ? JSON.stringify(result.feedback) : null,
        };

        const serialized = JSON.stringify(record);
        const lastSaved = sessionStorage.getItem('lastSavedEssay');
        if (lastSaved === serialized) {
          // Já salvo nessa sessão
          return;
        }

        // Verificar no banco se já existe um registro similar (proteção contra efeitos duplos)
        try {
          const { data: existing, error: selectError } = await supabase
            .from('essays')
            .select('id')
            .eq('user_id', user.id)
            .eq('essay_text', record.essay_text)
            .eq('final_score', record.final_score)
            .limit(1);

          if (selectError) {
            console.warn('Erro ao checar duplicatas antes de salvar:', selectError);
          } else if (existing && existing.length > 0) {
            // Já existe um registro idêntico
            try { sessionStorage.setItem('lastSavedEssay', serialized); } catch {}
            return;
          }
        } catch (err) {
          console.warn('Erro inesperado na verificação de duplicatas:', err);
        }

        const { data, error } = await supabase.from('essays').insert(record).select().single();
        if (error) {
          console.error('Erro ao salvar redação no histórico:', error);
        } else {
          try { sessionStorage.setItem('lastSavedEssay', serialized); } catch {}
          console.log('Redação salva no histórico:', data?.id);
        }
      } catch (err) {
        console.error('Erro inesperado ao salvar redação:', err);
      }
    })();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, user, isConfigured]);

  const getExampleData = () => {
    return {
      finalScore: 780,
      competencies: {
        'Competência I': 180,
        'Competência II': 160,
        'Competência III': 140,
        'Competência IV': 160,
        'Competência V': 140
      },
      feedback: {
        summary: "A redação aborda o tema da intolerância religiosa no Brasil de forma compreensiva e argumentativa, com exemplos históricos e atuais. A escrita é clara e coerente, mas há espaço para melhoria na profundidade dos argumentos e no detalhamento da proposta de intervenção.",
        improvements: [
          "Conexão mais explícita entre a citação de Einstein e o tema",
          "Profundidade maior nos argumentos", 
          "Detalhamento maior na proposta de intervenção"
        ],
        attention: [
          "Desenvolver mais a introdução para contextualizar a citação de Einstein",
          "Incluir exemplos mais concretos de como a intolerância religiosa afeta a sociedade atualmente",
          "Especificar os agentes e meios da proposta de intervenção"
        ],
        congratulations: [
          "Escrita clara e coerente",
          "Exemplos históricos e atuais relevantes",
          "Conexão com direitos humanos"
        ],
        competencyFeedback: {
          'Competência I': 'Demonstra bom domínio da modalidade escrita formal, com poucos desvios.',
          'Competência II': 'Desenvolve o tema adequadamente com argumentação consistente.',
          'Competência III': 'Apresenta informações organizadas em defesa do ponto de vista.',
          'Competência IV': 'Articula as partes do texto com adequação mediana.',
          'Competência V': 'Proposta de intervenção relacionada ao tema, mas com detalhamento insuficiente.'
        }
      },
      originalEssay: 'É mais fácil desintegrar um átomo que um preconceito. Com essa frase, Albert Einstein desvelou os entraves que envolvem o combate às diversas formas de discriminação existentes na sociedade.'
    };
  };

  const handleNewEssay = () => {
    window.location.href = '/envio';
  };

  const handlePrintResult = () => {
    window.print();
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  if (!result) {
    return (
      <ClientWrapper>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Carregando resultados...</p>
          </div>
        </div>
      </ClientWrapper>
    );
  }

  return (
    <ClientWrapper showFloatingMenu={false}>
      <div className="min-h-screen bg-background">

      {/* Header (copiado da página de envio) */}
      <div className="flex items-center p-6 max-w-6xl mx-auto">
        {/* Esconde logo e slogan no mobile (onde existe o menu hambúrguer) */}
          <div className="hidden md:flex items-center gap-2 header-item bg-gray-800/20 border border-gray-700/50 rounded-full px-4 py-2 backdrop-blur-sm">
            <Image src="/logo.PNG" alt="Reditto Logo" width={20} height={20} className="w-5 h-5" />
          <span className="header-text text-white/90 text-sm font-medium">Correção de Redação para Todos!</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
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
      <main className="max-w-6xl mx-auto p-6">
        {/* Score Overview */}
        <div className="card mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award size={32} className="text-yellow-400" />
              <h1 className="text-3xl font-bold text-white">Resultado da Correção</h1>
            </div>
            <div className="mb-6">
              <div className="text-6xl font-bold text-purple-400 mb-2">{result.finalScore || 0}</div>
              <div className="text-gray-300 text-lg">pontos de 1000</div>
              <div className="mt-3 text-white text-sm">
                {(result.finalScore || 0) >= 900 ? "Excelente! Redação nota 1000!" :
                 (result.finalScore || 0) >= 800 ? "Muito bom! Ótima redação!" :
                 (result.finalScore || 0) >= 700 ? "Bom desempenho! Continue melhorando!" :
                 (result.finalScore || 0) >= 600 ? "Desempenho mediano. Há espaço para melhoria." :
                 (result.finalScore || 0) >= 400 ? "Desempenho insuficiente. Foque nos pontos de atenção." :
                 "Desempenho precário. Revise os critérios do ENEM."}
              </div>
            </div>
            
            {/* Quick Competency Overview */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {result.competencies && Object.entries(result.competencies).map(([competency, score]) => (
                <div key={competency} className="text-center">
                  <div className="text-2xl font-bold text-purple-300">{score as number}</div>
                  <div className="text-xs text-gray-400">{competency.replace('Competência ', 'C')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="card mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain size={24} className="text-purple-400" />
            <h2 className="text-white text-xl font-semibold">Resumo da Análise</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">{result.feedback?.summary || 'Resumo não disponível'}</p>
        </div>

        {/* Congratulations Banner */}
        <div className="bg-green-600/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle size={24} className="text-green-400" />
            <h2 className="text-white font-semibold text-lg">Pontos Positivos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.feedback?.congratulations?.map((item: string, index: number) => (
              <div key={index} className="flex items-start gap-3 text-white">
                <CheckCircle size={16} className="text-green-400 mt-1 flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Improvements Section */}
        <div className="bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={24} className="text-blue-400" />
            <h2 className="text-white font-semibold text-lg">Sugestões de Melhoria</h2>
          </div>
          <div className="space-y-3">
            {result.feedback?.improvements?.map((item: string, index: number) => (
              <div key={index} className="flex items-start gap-3 text-white">
                <Lightbulb size={16} className="text-blue-400 mt-1 flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Attention Points */}
        <div className="bg-yellow-600/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={24} className="text-yellow-400" />
            <h2 className="text-white font-semibold text-lg">Pontos de Atenção</h2>
          </div>
          <div className="space-y-3">
            {result.feedback?.attention?.map((item: string, index: number) => (
              <div key={index} className="flex items-start gap-3 text-white">
                <Target size={16} className="text-yellow-400 mt-1 flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Competency Analysis */}
        <div className="mb-8">
          <h2 className="text-white text-xl font-semibold mb-6">Análise Detalhada por Competência</h2>
          <div className="space-y-6">
            {result.competencies && Object.entries(result.competencies).map(([competency, score]) => {
              const getScoreColor = (score: number) => {
                if (score >= 160) return 'text-green-400';
                if (score >= 120) return 'text-blue-400';
                if (score >= 80) return 'text-yellow-400';
                if (score >= 40) return 'text-orange-400';
                return 'text-red-400';
              };
              
              const getScoreDescription = (score: number) => {
                if (score >= 160) return 'Excelente/Bom';
                if (score >= 120) return 'Mediano';
                if (score >= 80) return 'Insuficiente';
                if (score >= 40) return 'Precário';
                return 'Muito Precário';
              };

              return (
                <div key={competency} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-lg">{competency}</h3>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(score as number)}`}>{score as number}</div>
                      <div className="text-xs text-gray-400">/ 200 pontos</div>
                      <div className={`text-xs ${getScoreColor(score as number)}`}>{getScoreDescription(score as number)}</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (score as number) >= 160 ? 'bg-green-400' :
                          (score as number) >= 120 ? 'bg-blue-400' :
                          (score as number) >= 80 ? 'bg-yellow-400' :
                          (score as number) >= 40 ? 'bg-orange-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${((score as number) / 200) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {result.feedback?.competencyFeedback?.[competency] || 
                     `Pontuação: ${score} pontos. ${competency === 'Competência I' ? 'Avalia o domínio da modalidade escrita formal da língua portuguesa.' : 
                     competency === 'Competência II' ? 'Avalia a compreensão do tema e aplicação de conceitos.' :
                     competency === 'Competência III' ? 'Avalia a capacidade de argumentação e organização de ideias.' :
                     competency === 'Competência IV' ? 'Avalia os mecanismos linguísticos para construção da argumentação.' : 'Avalia a elaboração de proposta de intervenção.'}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Original Essay Preview */}
        <div className="card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-purple-400" />
            <h2 className="text-white font-semibold">Sua Redação (prévia)</h2>
          </div>
                     <div className="bg-gray-800/20 rounded-2xl p-4 border border-gray-700/50 backdrop-blur-sm">
            <p className="text-gray-300 text-sm leading-relaxed">
              {result.originalEssay || 'Redação não disponível'}
              {(result.originalEssay?.length || 0) > 200 && '...'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleNewEssay}
            className="btn-primary"
          >
            <FileText size={20} />
            Nova Redação
          </button>
          <button
            onClick={handlePrintResult}
            className="btn-secondary"
          >
            <Printer size={20} />
            Imprimir Resultado
          </button>
        </div>
      </main>
      <Disclaimer />
      </div>
    </ClientWrapper>
  );
}