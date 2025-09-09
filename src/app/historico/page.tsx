'use client';

import ClientWrapper from '../components/ClientWrapper';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HistoricoPage() {
  const router = useRouter();

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

        <div className="max-w-5xl px-6 py-8 mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Histórico de Redações</h1>
          </div>

          <div className="p-6 rounded-2xl border border-gray-700/50 bg-gray-800/20 backdrop-blur-sm">
            <p className="text-gray-300">Seu histórico aparecerá aqui quando houver registros.</p>
          </div>
        </div>
      </div>
    </ClientWrapper>
  );
}


