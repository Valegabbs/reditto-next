'use client';

import { useEffect, useMemo, useState } from 'react';
import ClientWrapper from '../components/ClientWrapper';
import Sidebar from '../components/Sidebar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Usaremos uma implementação simples de gráfico usando SVG para evitar
// adicionar dependências externas. Abaixo renderizamos uma linha básica.

interface DataPoint { label: string; value: number | null; }

function SimpleLineChart({ data }: { data: DataPoint[] }) {
  const width = 700;
  const height = 220;
  const padding = 32;

  const values = data.map(d => (d.value ?? 0));
  const max = Math.max(...values, 100);
  const min = Math.min(...values, 0);

  const points = data.map((d, i) => {
    const x = padding + (i * (width - padding * 2)) / Math.max(1, data.length - 1);
    const y = height - padding - ((d.value ?? 0) - min) / Math.max(1, (max - min)) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <polyline fill="none" stroke="#8b5cf6" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" points={points} />
      {data.map((d, i) => {
        const x = padding + (i * (width - padding * 2)) / Math.max(1, data.length - 1);
        const y = height - padding - ((d.value ?? 0) - min) / Math.max(1, (max - min)) * (height - padding * 2);
        return <circle key={i} cx={x} cy={y} r={4} fill="#8b5cf6" />;
      })}
    </svg>
  );
}

export default function EvolucaoPage() {
  const { user, isConfigured } = useAuth();
  const [scores, setScores] = useState<Array<{ id: string; final_score: number | null; created_at: string; topic?: string | null }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user || !isConfigured) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.from('essays').select('id, final_score, created_at, topic').eq('user_id', user.id).order('created_at', { ascending: true });
        if (error) throw error;
        setScores((data || []) as any);
      } catch (err) {
        console.error('Erro ao carregar evolução:', err);
        setScores([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, isConfigured]);

  const dataPoints = useMemo(() => scores.map((s, i) => ({ label: s.topic || `Red ${i + 1}`, value: s.final_score } as DataPoint)), [scores]);

  const stats = useMemo(() => {
    const valid = scores.map(s => s.final_score ?? 0);
    if (valid.length === 0) return { avg: null, min: null, max: null };
    const sum = valid.reduce((a, b) => a + b, 0);
    return { avg: Math.round(sum / valid.length), min: Math.min(...valid), max: Math.max(...valid) };
  }, [scores]);

  return (
    <ClientWrapper showFloatingMenu={false}>
      <div className="min-h-screen bg-background">
        <div className="flex">
          <Sidebar />
          <div className="w-full">
            <div className="max-w-5xl px-6 py-8 mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-white">Evolução</h1>
              </div>
              <div className="p-6 rounded-2xl border border-gray-700/50 bg-gray-800/20 backdrop-blur-sm">
                {loading ? (
                  <div className="text-gray-300">Carregando evolução...</div>
                ) : scores.length === 0 ? (
                  <div className="text-gray-300">Sem dados para exibir. Envie sua primeira redação!</div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-full overflow-hidden rounded-xl bg-gray-900/20 p-4">
                      <SimpleLineChart data={dataPoints} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg panel-base">
                        <div className="text-sm text-gray-400">Média</div>
                        <div className="text-2xl font-semibold text-white">{stats.avg ?? '—'}</div>
                      </div>
                      <div className="p-4 rounded-lg panel-base">
                        <div className="text-sm text-gray-400">Pior Nota</div>
                        <div className="text-2xl font-semibold text-white">{stats.min ?? '—'}</div>
                      </div>
                      <div className="p-4 rounded-lg panel-base">
                        <div className="text-sm text-gray-400">Melhor Nota</div>
                        <div className="text-2xl font-semibold text-white">{stats.max ?? '—'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientWrapper>
  );
}


