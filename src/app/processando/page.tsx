'use client';

import { useEffect, useRef, useState } from 'react';
import ClientWrapper from '../components/ClientWrapper';

type ProcessingJob =
  | { type: 'text'; topic: string; essayText: string }
  | { type: 'image'; topic: string; imageDataUrl: string };

export default function ProcessandoPage() {
  const [progress, setProgress] = useState<number>(10);
  const [statusText, setStatusText] = useState<string>('Preparando processamento...');
  const intervalRef = useRef<number | null>(null);
  const targetRef = useRef<number>(30);

  const startProgress = () => {
    if (intervalRef.current) return;
    intervalRef.current = window.setInterval(() => {
      setProgress((current) => {
        const target = targetRef.current;
        if (current >= target) return current;
        const step = Math.max(0.2, (target - current) / 25);
        const next = Math.min(target, current + step);
        return next;
      });
    }, 100);
  };

  const setTarget = (value: number) => {
    targetRef.current = value;
  };

  const stopProgress = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startProgress();

    const run = async () => {
      try {
        const raw = sessionStorage.getItem('reditto-processing');
        if (!raw) {
          window.location.href = '/envio';
          return;
        }

        const job: ProcessingJob = JSON.parse(raw);

        // Etapa 1: OCR (se necessário)
        let finalEssayText: string | null = null;
        if (job.type === 'image') {
          setStatusText('Extraindo texto da imagem...');
          setTarget(35);

          // Reconstituir File a partir do Data URL
          const res = await fetch(job.imageDataUrl);
          const blob = await res.blob();
          const file = new File([blob], 'redacao.jpg', { type: blob.type || 'image/jpeg' });

          const ocrFormData = new FormData();
          ocrFormData.append('image', file);

          const ocrResponse = await fetch('/api/extract-text', { method: 'POST', body: ocrFormData });
          if (!ocrResponse.ok) {
            const errorData = await ocrResponse.json().catch(() => ({ error: 'Erro no OCR' }));
            throw new Error(errorData.error || 'Falha ao extrair texto da imagem');
          }

          const ocrResult = await ocrResponse.json();
          finalEssayText = ocrResult.extractedText as string;
          setTarget(50);
        } else {
          finalEssayText = job.essayText;
          setTarget(40);
        }

        // Etapa 2: Correção
        setStatusText('Analisando redação com IA...');
        setTarget(85);

        const correctionFormData = new FormData();
        correctionFormData.append('topic', job.topic || '');
        correctionFormData.append('essayText', finalEssayText || '');

        const response = await fetch('/api/correct-essay', { method: 'POST', body: correctionFormData });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
          throw new Error(errorData.error || 'Falha ao processar a redação');
        }

        const result = await response.json();
        setStatusText('Finalizando...');
        setTarget(100);

        // Aguarda a barra chegar em 100%
        const waitUntilFull = async () => {
          await new Promise((resolve) => setTimeout(resolve, 400));
        };
        await waitUntilFull();

        sessionStorage.removeItem('reditto-processing');
        window.location.href = `/resultados?data=${encodeURIComponent(JSON.stringify(result))}`;
      } catch (error: unknown) {
        console.error('Erro no processamento:', error);
        alert(`Erro ao processar a redação: ${error instanceof Error ? error.message : 'Tente novamente.'}`);
        window.location.href = '/envio';
      } finally {
        stopProgress();
      }
    };

    run();

    return () => {
      stopProgress();
    };
  }, []);

  return (
    <ClientWrapper showFloatingMenu={false}>
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <div className="main-form rounded-3xl p-8">
            <h1 className="text-2xl font-bold text-white mb-4 text-center">Processando sua redação</h1>
            <p className="text-gray-300 text-sm mb-6 text-center">{statusText}</p>
            <div className="w-full h-3 bg-gray-700/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 transition-[width] duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-right text-gray-400 text-xs mt-2">{Math.round(progress)}%</div>
          </div>
        </div>
      </div>
    </ClientWrapper>
  );
}


