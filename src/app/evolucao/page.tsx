'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, TrendingUp, Loader2 } from 'lucide-react';
import ClientWrapper from '../components/ClientWrapper';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

type EssayPoint = {
  id: string;
  created_at: string;
  final_score: number;
};

export default function EvolucaoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [points, setPoints] = useState<EssayPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  // Responsividade simples: observar largura do container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.getBoundingClientRect().width;
        setContainerWidth(Math.max(320, Math.floor(width)));
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('essays')
          .select('id, created_at, final_score')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setPoints((data || []) as EssayPoint[]);
      } catch (err: any) {
        console.error('Erro ao carregar dados de evolução:', err);
        setError(err?.message || 'Erro ao carregar evolução');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const chart = useMemo(() => {
    if (!points.length) return null;

    const margin = { top: 24, right: 24, bottom: 40, left: 44 };
    const width = containerWidth;
    const height = 320;
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const dates = points.map(p => new Date(p.created_at).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const minScore = 0;
    const maxScore = 1000;

    const xScale = (t: number) => {
      if (maxDate === minDate) return margin.left + innerW / 2;
      return margin.left + ((t - minDate) / (maxDate - minDate)) * innerW;
    };
    const yScale = (s: number) => margin.top + innerH - ((s - minScore) / (maxScore - minScore)) * innerH;

    const pathD = points
      .map((p, i) => {
        const x = xScale(new Date(p.created_at).getTime());
        const y = yScale(p.final_score);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    const circles = points.map((p) => {
      const x = xScale(new Date(p.created_at).getTime());
      const y = yScale(p.final_score);
      return { x, y, id: p.id, label: p.final_score };
    });

    const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'short', day: '2-digit' });
    const ticks = points.map(p => ({ x: xScale(new Date(p.created_at).getTime()), label: formatter.format(new Date(p.created_at)) }));

    const avg = Math.round(points.reduce((a, b) => a + b.final_score, 0) / points.length);
    const best = Math.max(...points.map(p => p.final_score));
    const worst = Math.min(...points.map(p => p.final_score));

    return { width, height, margin, pathD, circles, ticks, avg, best, worst };
  }, [points, containerWidth]);

  const isAuthenticated = Boolean(user);

  return (
    <ClientWrapper showFloatingMenu={false}>
      <div className="min-h-screen bg-background">
        <button
          onClick={() => router.push('/envio')}
          className="fixed left-3 top-6 z-50 p-2 rounded-lg backdrop-blur-sm transition-colors sidebar-toggle-button"
          aria-label="Voltar para envio"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="max-w-5xl px-6 py-8 mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <TrendingUp size={24} className="text-purple-400" />
              Evolução das suas redações
            </h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 size={32} className="animate-spin text-purple-500" />
              <span className="ml-2 text-gray-300">Carregando evolução...</span>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl border border-red-500/30 bg-red-900/20 backdrop-blur-sm">
              <p className="text-red-300">{error}</p>
            </div>
          ) : !isAuthenticated ? (
            <div className="p-6 rounded-2xl border border-gray-700/50 bg-gray-800/20 backdrop-blur-sm">
              <p className="text-gray-300">Faça login para visualizar sua evolução.</p>
            </div>
          ) : !points.length ? (
            <div className="p-6 rounded-2xl border border-gray-700/50 bg-gray-800/20 backdrop-blur-sm">
              <p className="text-gray-300">Você ainda não possui correções para exibir. Envie sua primeira redação!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div ref={containerRef} className="p-4 rounded-2xl border border-gray-700/50 bg-gray-800/20 backdrop-blur-sm">
                {chart && (
                  <svg width={chart.width} height={320} role="img" aria-label="Gráfico de evolução de notas">
                    <desc>Notas finais por data de envio</desc>
                    {/* Eixos */}
                    <line x1={chart.margin.left} y1={320 - chart.margin.bottom} x2={chart.width - chart.margin.right} y2={320 - chart.margin.bottom} stroke="#4b5563" strokeOpacity="0.5" />
                    <line x1={chart.margin.left} y1={chart.margin.top} x2={chart.margin.left} y2={320 - chart.margin.bottom} stroke="#4b5563" strokeOpacity="0.5" />

                    {/* Grid horizontal (a cada 200 pts) */}
                    {[0, 200, 400, 600, 800, 1000].map((s) => {
                      const y = chart.margin.top + (320 - chart.margin.top - chart.margin.bottom) - (s / 1000) * (320 - chart.margin.top - chart.margin.bottom);
                      return (
                        <g key={s}>
                          <line x1={chart.margin.left} y1={y} x2={chart.width - chart.margin.right} y2={y} stroke="#374151" strokeDasharray="4 4" />
                          <text x={chart.margin.left - 10} y={y + 4} textAnchor="end" className="fill-gray-400 text-xs">{s}</text>
                        </g>
                      );
                    })}

                    {/* Linha */}
                    <path d={chart.pathD} fill="none" stroke="#14b8a6" strokeWidth={3} strokeLinecap="round" />

                    {/* Pontos */}
                    {chart.circles.map((c) => (
                      <g key={c.id}>
                        <circle cx={c.x} cy={c.y} r={5} fill="#f87171" />
                        <text x={c.x} y={c.y - 10} textAnchor="middle" className="fill-gray-300 text-[10px]">{c.label}</text>
                      </g>
                    ))}

                    {/* Ticks de data */}
                    {chart.ticks.map((t, i) => (
                      <text key={i} x={t.x} y={320 - chart.margin.bottom + 16} textAnchor="middle" className="fill-gray-400 text-xs">
                        {t.label}
                      </text>
                    ))}
                  </svg>
                )}
              </div>

              {/* Resumo */}
              {chart && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-2xl border border-gray-700/50 bg-gray-800/20">
                    <div className="text-sm text-gray-400">Média</div>
                    <div className="text-2xl font-bold text-purple-300">{chart.avg}</div>
                  </div>
                  <div className="p-4 rounded-2xl border border-gray-700/50 bg-gray-800/20">
                    <div className="text-sm text-gray-400">Melhor</div>
                    <div className="text-2xl font-bold text-green-400">{chart.best}</div>
                  </div>
                  <div className="p-4 rounded-2xl border border-gray-700/50 bg-gray-800/20">
                    <div className="text-sm text-gray-400">Pior</div>
                    <div className="text-2xl font-bold text-red-400">{chart.worst}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ClientWrapper>
  );
}

 