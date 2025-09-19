'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Image from 'next/image';
import { Sun } from 'lucide-react';
import ClientWrapper from '../components/ClientWrapper';
import Sidebar from '../components/Sidebar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Usaremos uma implementação simples de gráfico usando SVG para evitar
// adicionar dependências externas. Abaixo renderizamos uma linha básica.

interface DataPoint { id?: string; label: string; value: number | null; }

function InteractiveLineChart({ data }: { data: DataPoint[] }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 760;
  const height = 300;
  const padding = 48;

  const values = data.map(d => (d.value ?? 0));
  const maxVal = Math.max(...values, 1000);
  const minVal = 0;

  // Y ticks fixed as requested
  const yTicks = [200, 400, 600, 800, 1000];

  const xCount = Math.max(1, data.length);
  const xPositions = data.map((_, i) => padding + (i * (width - padding * 2)) / Math.max(1, xCount - 1));

  const points = data.map((d, i) => {
    const x = xPositions[i];
    const y = height - padding - ((d.value ?? 0) - minVal) / Math.max(1, (maxVal - minVal)) * (height - padding * 2);
    return { x, y };
  });

  const handleMove = (evt: React.MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = evt.clientX - rect.left;
    // find nearest x
    let nearest = 0;
    let nearestDist = Infinity;
    xPositions.forEach((x, i) => {
      const d = Math.abs(x - mx);
      if (d < nearestDist) { nearestDist = d; nearest = i; }
    });
    setHoverIndex(nearest);
  };

  const handleLeave = () => setHoverIndex(null);

  // abbreviate x labels depending on count
  const formatXLabel = (i: number) => {
    if (xCount > 20) return `${i + 1}`;
    if (xCount > 10) return `Red ${i + 1}`;
    return `Redação ${i + 1}`;
  };

  return (
    <div ref={containerRef} className="w-full overflow-x-auto">
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" onMouseMove={handleMove} onMouseLeave={handleLeave}>
        {/* grid lines and y axis labels */}
        {yTicks.map((t, idx) => {
          const y = height - padding - (t - minVal) / Math.max(1, (maxVal - minVal)) * (height - padding * 2);
          return (
            <g key={t}>
              <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="rgba(11,18,32,0.06)" strokeWidth={1} />
              <text x={padding - 10} y={y + 4} textAnchor="end" className="text-xs y-label">{t}</text>
            </g>
          );
        })}

        {/* x labels */}
        {xPositions.map((x, i) => (
          <text key={i} x={x} y={height - 8} textAnchor="middle" className="text-xs x-label" style={{ transformOrigin: `${x}px ${height - 8}px` }}>{formatXLabel(i)}</text>
        ))}

        {/* polyline */}
        <polyline
          fill="none"
          stroke="var(--reditto-purple)"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
        />

        {/* filled area subtle */}
        <polygon className="fill-area" points={`${padding},${height - padding} ${points.map(p => `${p.x},${p.y}`).join(' ')} ${width - padding},${height - padding}`} />

        {/* fixed points (always visible) */}
        {points.map((p, i) => (
          <g key={`pt-${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 6 : 4}
              fill={hoverIndex === i ? '#fff' : 'var(--reditto-purple)'}
              stroke={hoverIndex === i ? 'var(--reditto-purple)' : 'transparent'}
              strokeWidth={2}
              style={{ cursor: data[i]?.id ? 'pointer' : 'default' }}
              onClick={() => {
                if (data[i]?.id) {
                  // Redirect to resultados page using existing record id to avoid creating new DB entries
                  window.location.href = `/resultados?essayId=${encodeURIComponent(String(data[i].id))}`;
                }
              }}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          </g>
        ))}
      </svg>

      {/* tooltip */}
      {hoverIndex !== null && points[hoverIndex] && (
        <div className="absolute pointer-events-none z-50" style={{ transform: 'translateY(-100%)' }}>
          <div className="bg-black/80 text-white text-sm px-3 py-2 rounded-lg shadow-lg">
            <div className="font-semibold">{formatXLabel(hoverIndex)}</div>
            <div className="text-xs text-gray-200">{data[hoverIndex].value ?? '—'}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EvolucaoPage() {
  const { user, isConfigured, signOut } = useAuth();
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

  const dataPoints = useMemo(() => scores.map((s, i) => ({ id: s.id, label: s.topic || `Red ${i + 1}`, value: s.final_score } as DataPoint)), [scores]);

  const stats = useMemo(() => {
    const valid = scores.map(s => s.final_score ?? 0);
    if (valid.length === 0) return { avg: null, min: null, max: null };
    const sum = valid.reduce((a, b) => a + b, 0);
    return { avg: Math.round(sum / valid.length), min: Math.min(...valid), max: Math.max(...valid) };
  }, [scores]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <ClientWrapper showFloatingMenu={false}>
      <div className="min-h-screen bg-background">
        <div className="flex">
          <Sidebar />
          <div className="w-full">
            <div className="max-w-6xl px-6 py-8 mx-auto">
              {/* Header (same as Envio) */}
              <div className="flex items-center p-6 mb-4">
                <div className="hidden md:flex items-center gap-2 header-item bg-gray-800/20 border border-gray-700/50 rounded-full px-4 py-2 backdrop-blur-sm">
                  <Image src="/assets/logo.PNG" alt="Reditto Logo" width={20} height={20} className="w-5 h-5" />
                  <span className="header-text text-white/90 text-sm font-medium">Correção de Redação para Todos!</span>
                </div>
                <button
                  onClick={() => {
                    const current = document.documentElement.getAttribute('data-theme') || 'dark';
                    const next = current === 'dark' ? 'light' : 'dark';
                    document.documentElement.setAttribute('data-theme', next);
                    try { localStorage.setItem('reditto-theme', next); } catch {}
                  }}
                  className="ml-auto text-white hover:text-yellow-400 transition-colors p-2 rounded-full hover:bg-gray-800/20 backdrop-blur-sm header-text"
                  aria-label="Alternar tema"
                >
                  <Sun size={20} />
                </button>
                <button onClick={handleSignOut} className="ml-2 text-white hover:text-red-400 transition-colors p-2 rounded-full">
                  Sair
                </button>
              </div>

              <div className="mb-6">
                <h1 className="text-3xl font-bold text-white">Evolução</h1>
                <p className="text-gray-300 mt-2">Acompanhe a sua evolução de notas ao longo das redações. Passe o mouse sobre os pontos para ver a redação e clique para abrir o histórico.</p>
              </div>

              <div className="p-6 rounded-2xl border border-gray-700/50 bg-gray-800/20 backdrop-blur-sm">
                {loading ? (
                  <div className="text-gray-300">Carregando evolução...</div>
                ) : scores.length === 0 ? (
                  <div className="text-gray-300">Sem dados para exibir. Envie sua primeira redação!</div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-full overflow-hidden rounded-xl p-4 relative evolution-chart">
                      <InteractiveLineChart data={dataPoints} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg panel-base bg-gradient-to-br from-purple-700/10 to-purple-700/5">
                        <div className="text-sm text-gray-400">Média</div>
                        <div className="text-2xl font-semibold text-white">{stats.avg ?? '—'}</div>
                      </div>
                      <div className="p-4 rounded-lg panel-base bg-gradient-to-br from-red-600/8 to-red-600/4">
                        <div className="text-sm text-gray-400">Pior Nota</div>
                        <div className="text-2xl font-semibold text-white">{stats.min ?? '—'}</div>
                      </div>
                      <div className="p-4 rounded-lg panel-base bg-gradient-to-br from-green-600/8 to-green-600/4">
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


