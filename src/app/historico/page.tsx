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
        .select('id, topic, final_score, created_at')
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'essays' }, (payload) => {
        // Recarregar ao detectar mudança relevante para este usuário
        if (payload.record?.user_id === user?.id) loadEssays();
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
                    {essays.map((e, idx) => (
                      <article key={e.id} onClick={() => window.location.href = `/historico/${e.id}`} className="group cursor-pointer p-6 rounded-2xl panel-base border border-gray-700/40 hover:scale-105 transform transition-all duration-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-yellow-500/10 p-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-white">{`Redação ${idx + 1}: ${e.topic || 'Sem tema'}`}</div>
                              <div className="text-sm text-gray-400">Enviada em: {new Date(e.created_at).toLocaleString()}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-3xl font-extrabold text-purple-400">{e.final_score ?? '—'}</div>
                            <button onClick={(ev) => { ev.stopPropagation(); handleDelete(e.id); }} className="text-sm text-red-400 hover:text-red-600 transition-colors">Excluir</button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center gap-6">
                            {/* Pequena prévia das competências (se houver) - mostramos placeholders se não */}
                            <div>C1: <span className="text-purple-300 font-semibold">{/* placeholder */ '—'}</span></div>
                            <div>C2: <span className="text-purple-300 font-semibold">{'—'}</span></div>
                            <div>C3: <span className="text-purple-300 font-semibold">{'—'}</span></div>
                            <div>C4: <span className="text-purple-300 font-semibold">{'—'}</span></div>
                            <div>C5: <span className="text-purple-300 font-semibold">{'—'}</span></div>
                          </div>
                          <div className="text-xs text-gray-500">Clique para ver a correção completa</div>
                        </div>
                      </article>
                    ))}
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


