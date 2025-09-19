'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Sun } from 'lucide-react';
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
  const { user, isConfigured, signOut } = useAuth();
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
    try {
      const ok = await (window as any).redittoConfirm?.('Deseja realmente excluir esta redação?');
      if (!ok) return;

      const { error } = await supabase.from('essays').delete().eq('id', id).eq('user_id', user?.id);
      if (error) throw error;
      setEssays(prev => prev.filter(e => e.id !== id));
      window.dispatchEvent(new CustomEvent('reditto:toast', { detail: { message: 'Redação excluída com sucesso.', type: 'success' } }));
    } catch (err) {
      console.error('Erro ao excluir redação:', err);
      window.dispatchEvent(new CustomEvent('reditto:toast', { detail: { message: 'Falha ao excluir. Tente novamente.', type: 'error' } }));
    }
  };

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
            <div className="max-w-5xl px-6 py-8 mx-auto">
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
                <h1 className="text-3xl font-bold text-white">Histórico de Redações</h1>
                <p className="text-gray-300 mt-2">Veja todas as suas redações corrigidas — toque em qualquer card para rever a correção completa.</p>
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
                              <div className="status-circle p-2 rounded-full" aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <path fill="#ffffff" d="M20.285 6.708a1 1 0 00-1.414-1.416l-9.193 9.193-3.172-3.172a1 1 0 10-1.414 1.414l3.88 3.88a1 1 0 001.414 0l9.899-9.899z" />
                                </svg>
                              </div>
                              <div>
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-200/60 to-gray-200/40 px-4 py-1 rounded-full">
                                  <div className="text-xs font-semibold tracking-wide text-yellow-400">&nbsp;</div>
                                  <div className="text-sm font-semibold text-black">{title}</div>
                                </div>
                                <div className="text-sm hist-date mt-2">Enviada em: {new Date(e.created_at).toLocaleString()}</div>
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-5xl font-extrabold hist-score">{e.final_score ?? '—'}</div>
                              <div className="text-sm hist-score-desc">pontos de 1000</div>
                              <div className="text-xs hist-feedback mt-2">{performanceText(e.final_score ?? 0)}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-5 gap-4 mt-6 text-center">
                            <div>
                              <div className="text-lg font-bold" style={{color: '#7734e7'}}>{c1}</div>
                              <div className="text-xs text-gray-400">C1</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold" style={{color: '#7734e7'}}>{c2}</div>
                              <div className="text-xs text-gray-400">C2</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold" style={{color: '#7734e7'}}>{c3}</div>
                              <div className="text-xs text-gray-400">C3</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold" style={{color: '#7734e7'}}>{c4}</div>
                              <div className="text-xs text-gray-400">C4</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold" style={{color: '#7734e7'}}>{c5}</div>
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


