'use client';

import { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertTriangle, Lightbulb, Printer, Brain } from 'lucide-react';
import Image from 'next/image';
import ClientWrapper from '../components/ClientWrapper';

interface EssayResult {
  finalScore: number;
  competencies: {
    [key: string]: number;
  };
  feedback: {
    summary: string;
    improvements: string[];
    attention: string[];
    congratulations: string[];
    competencyFeedback: {
      [key: string]: string;
    };
  };
  originalEssay: string;
}

export default function ResultadosPage() {
  const [result, setResult] = useState<EssayResult | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    
    if (dataParam) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(dataParam));
        setResult(parsedData);
      } catch (error) {
        console.error('Erro ao parsear dados:', error);
        // Dados de exemplo para demonstração
        setResult({
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
            ]
          },
          originalEssay: `"É mais fácil desintegrar um átomo que um preconceito". Com essa frase, Albert Einstein desvelou os entraves que envolvem o combate às diversas formas de discriminação existentes na sociedade. Isso inclui a intolerância religiosa, comportamento frequente que deve ser erradicado do Brasil. Desde a colonização, o país tem enfrentado desafios relacionados à diversidade religiosa, e é fundamental que medidas sejam implementadas para promover o respeito e a tolerância entre diferentes crenças.`
        });
      }
    }
  }, []);

  const handleNewEssay = () => {
    window.location.href = '/envio';
  };

  const handlePrintResult = () => {
    window.print();
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
    <ClientWrapper>
      <div className="min-h-screen bg-background pt-16">

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
                 {/* Congratulations Banner */}
         <div className="bg-green-600/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle size={24} className="text-white" />
            <h2 className="text-white font-semibold text-lg">Parabéns!</h2>
          </div>
          <ul className="text-white space-y-1">
            {result.feedback.congratulations.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feedback by Competency */}
        <div className="mb-8">
          <h2 className="text-white text-xl font-semibold mb-4">Feedback por Competência</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(result.competencies).map(([competency, score]) => (
              <div key={competency} className="card">
                <h3 className="text-white font-medium mb-2">{competency}</h3>
                <p className="text-gray-300 text-sm">
                  {result.feedback.competencyFeedback[competency] || 
                   `Pontuação: ${score} pontos. ${competency === 'Competência I' ? 'Modalidade Escrita' : 
                   competency === 'Competência II' ? 'Compreensão do Tema' :
                   competency === 'Competência III' ? 'Argumentação' :
                   competency === 'Competência IV' ? 'Coesão e Coerência' : 'Proposta de Intervenção'}`}
                </p>
              </div>
            ))}
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
              {result.originalEssay}
              {result.originalEssay.length > 200 && '...'}
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
      </div>
    </ClientWrapper>
  );
}
