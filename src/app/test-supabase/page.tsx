'use client';

import { useState } from 'react';
import { supabase, isSupabaseConfigured, testSupabaseConnection } from '@/lib/supabase';

export default function SupabaseTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      // Teste 1: Verificar configuração
      const configured = isSupabaseConfigured();
      setTestResult(prev => prev + `1. Configuração: ${configured ? '✅ OK' : '❌ FALHOU'}\n`);

      if (!configured) {
        setTestResult(prev => prev + '❌ Supabase não configurado corretamente\n');
        return;
      }

      // Teste 2: Testar conexão
      const connected = await testSupabaseConnection();
      setTestResult(prev => prev + `2. Conexão: ${connected ? '✅ OK' : '❌ FALHOU'}\n`);

      if (!connected) {
        setTestResult(prev => prev + '❌ Não foi possível conectar ao Supabase\n');
        return;
      }

      // Teste 3: Tentar criar usuário de teste
      const testEmail = `teste-${Date.now()}@exemplo.com`;
      const testPassword = '123456';
      
      setTestResult(prev => prev + `3. Testando criação de usuário...\n`);
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: 'Usuário Teste'
          }
        }
      });

      if (error) {
        setTestResult(prev => prev + `❌ Erro ao criar usuário: ${error.message}\n`);
      } else {
        setTestResult(prev => prev + `✅ Usuário criado com sucesso!\n`);
        setTestResult(prev => prev + `📧 Email: ${testEmail}\n`);
        setTestResult(prev => prev + `🔑 Senha: ${testPassword}\n`);
      }

    } catch (error) {
      setTestResult(prev => prev + `❌ Erro inesperado: ${error}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Teste do Supabase</h2>
      
      <button
        onClick={runTest}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Testando...' : 'Executar Teste'}
      </button>

      {testResult && (
        <div className="mt-4 p-4 bg-gray-900 rounded">
          <pre className="text-green-400 text-sm whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </div>
  );
}

