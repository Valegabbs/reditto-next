'use client';

import { useEffect, useState } from 'react';
import ClientWrapper from '../components/ClientWrapper';
import Sidebar from '../components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface EssayRow {
  id: string;
  topic?: string | null;
  final_score?: number | null;
  essay_text?: string | null;
  competencies?: any;
  feedback?: any;
  created_at: string;
}

export default function HistoricoPage() {
  const { user, isConfigured } = useAuth();
  const [essays, setEssays] = useState<EssayRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEssays = async () => {
    if (!user || !isConfigured) {
      setEssays([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('essays')
        .select('id, topic, final_score, created_at, essay_text, competencies, feedback')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEssays((data || []) as EssayRow[]);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setEssays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEssays();
    // Inscrever para mudanças em tempo real (opcional)
    const subscription = supabase
      .channel('public:essays')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'essays' }, (payload: any) => {
        // Recarregar ao detectar mudança relevante para este usuário
        // Payload shape can vary between SDK versions: check common fields
        const rec = payload?.record ?? payload?.new ?? (Array.isArray(payload?.rows) ? payload.rows[0] : null);
        if (rec?.user_id === user?.id) loadEssays();
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(subscription); } catch {};
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isConfigured]);

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta redação?')) return;
    try {
      const { error } = await supabase.from('essays').delete().eq('id', id).eq('user_id', user?.id);
      if (error) throw error;
      setEssays(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Erro ao excluir redação:', err);
      alert('Falha ao excluir. Tente novamente.');
    }
  };

  return (
    <ClientWrapper showFloatingMenu={false}>
      <div className="min-h-screen bg-background">
        <div className="flex">
          <Sidebar />
          <div className="w-full">
            <div className="max-w-5xl px-6 py-8 mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-white">Histórico de Redações</h1>
              </div>

              <div className="p-6 rounded-2xl border border-gray-700/50 bg-gray-800/20 backdrop-blur-sm">
                {loading ? (
                  <div className="text-center text-gray-300">Carregando histórico...</div>
                ) : essays.length === 0 ? (
                  <p className="text-gray-300">Seu histórico aparecerá aqui quando houver registros.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {essays.map((e, idx) => {
                      // preparar competências para exibição
                      let comps: any = null;
                      try { comps = e.competencies ? (typeof e.competencies === 'string' ? JSON.parse(e.competencies) : e.competencies) : null; } catch { comps = null; }
                      const c1 = comps ? (comps['Competência I'] ?? comps['C1'] ?? '—') : '—';
                      const c2 = comps ? (comps['Competência II'] ?? comps['C2'] ?? '—') : '—';
                      const c3 = comps ? (comps['Competência III'] ?? comps['C3'] ?? '—') : '—';
                      const c4 = comps ? (comps['Competência IV'] ?? comps['C4'] ?? '—') : '—';
                      const c5 = comps ? (comps['Competência V'] ?? comps['C5'] ?? '—') : '—';

                      const title = `Redação ${idx + 1}: ${e.topic || 'Sem tema'}`;

                      const performanceText = (score: number | null) => {
                        const s = score ?? 0;
                        if (s >= 900) return 'Excelente! Redação nota 1000!';
                        if (s >= 800) return 'Muito bom! Ótima redação!';
                        if (s >= 700) return 'Bom desempenho! Continue melhorando!';
                        if (s >= 600) return 'Desempenho mediano. Há espaço para melhoria.';
                        if (s >= 400) return 'Desempenho insuficiente. Foque nos pontos de atenção.';
                        return 'Desempenho precário. Revise os critérios do ENEM.';
                      };

                      const handleOpen = async () => {
                        // construir payload semelhante ao de /resultados
                        const payload = {
                          finalScore: e.final_score ?? 0,
                          competencies: comps,
                          feedback: e.feedback ? (typeof e.feedback === 'string' ? JSON.parse(e.feedback) : e.feedback) : null,
                          originalEssay: e.essay_text || '',
                          topic: e.topic || null
                        };
                        window.location.href = `/resultados?data=${encodeURIComponent(JSON.stringify(payload))}`;
                      };

                      return (
                        <article key={e.id} onClick={handleOpen} className="group cursor-pointer p-6 rounded-2xl panel-base border border-gray-700/40 hover:scale-105 transform transition-all duration-200">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="rounded-full bg-yellow-500/10 p-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                                </svg>
                              </div>
                              <div>
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-800/60 to-gray-800/40 px-4 py-1 rounded-full">
                                  <div className="text-xs font-semibold tracking-wide text-yellow-400">&nbsp;</div>
                                  <div className="text-sm font-semibold text-white">{title}</div>
                                </div>
                                <div className="text-sm text-gray-400 mt-2">Enviada em: {new Date(e.created_at).toLocaleString()}</div>
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-5xl font-extrabold text-purple-400">{e.final_score ?? '—'}</div>
                              <div className="text-sm text-gray-300">pontos de 1000</div>
                              <div className="text-xs text-gray-400 mt-2">{performanceText(e.final_score ?? 0)}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-5 gap-4 mt-6 text-center">
                            <div>
                              <div className="text-lg font-bold text-purple-300">{c1}</div>
                              <div className="text-xs text-gray-400">C1</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-purple-300">{c2}</div>
                              <div className="text-xs text-gray-400">C2</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-purple-300">{c3}</div>
                              <div className="text-xs text-gray-400">C3</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-purple-300">{c4}</div>
                              <div className="text-xs text-gray-400">C4</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-purple-300">{c5}</div>
                              <div className="text-xs text-gray-400">C5</div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
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


