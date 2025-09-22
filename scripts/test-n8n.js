// Script para testar a integração com o n8n
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

// Usar valores diretos para teste
const N8N_WEBHOOK_URL = "https://reditto-n8n.004ose.easypanel.host/webhook/reditto";
const N8N_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NDJjNjNmZi1mYWU0LTRmYmYtOTEwMy02OTRlZDc5OGY3YjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NDY4NzI3LCJleHAiOjE3NjEwMTkyMDB9.FGXbPSa1Z5JN48dOrjf8Pmvmi4ClGsudOlyWGjeABLA";

console.log('=== CONFIGURAÇÃO DE TESTE ===');
console.log('N8N_WEBHOOK_URL:', N8N_WEBHOOK_URL ? 'Configurada' : 'Não configurada');
console.log('N8N_API_KEY:', N8N_API_KEY ? `Configurada (${N8N_API_KEY.substring(0, 15)}...)` : 'Não configurada');

// Função para testar a conexão com o n8n
async function testN8nConnection() {
  console.log('\n=== TESTE DE INTEGRAÇÃO COM N8N ===');
  console.log('Base URL:', N8N_WEBHOOK_URL || '❌ NÃO CONFIGURADA');
  console.log('API Key:', N8N_API_KEY ? `✅ Configurada (${N8N_API_KEY.substring(0, 15)}...)` : '❌ NÃO CONFIGURADA');

  if (!N8N_WEBHOOK_URL) {
    console.log('\n❌ N8N_WEBHOOK_URL não configurada! Configure no arquivo .env.local');
    return;
  }

  if (!N8N_API_KEY) {
    console.log('\n⚠️ N8N_API_KEY não configurada! A autenticação pode falhar.');
  }

  // Teste simples com uma mensagem de texto
  const testPayload = {
    text: "Esta é uma redação de teste para verificar a integração com o n8n.",
    topic: "Teste de Integração"
  };

  try {
    console.log('\n🔄 Enviando requisição de teste para o webhook do n8n...');
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${N8N_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Reditto-Next/1.0'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📊 Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Erro desconhecido');
      console.error('❌ Erro na resposta:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      console.log('\n❌ TESTE FALHOU: Não foi possível conectar ao webhook do n8n.');
      return;
    }

    const data = await response.json();
    console.log('✅ Resposta recebida com sucesso!');
    console.log('📄 Estrutura da resposta:', Object.keys(data));
    console.log('\n📝 Exemplo de dados recebidos:');
    console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
    
    console.log('\n✅ TESTE BEM-SUCEDIDO: A integração com o n8n está funcionando!');
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o n8n:', error);
    console.log('\n❌ TESTE FALHOU: Ocorreu um erro ao tentar conectar com o webhook do n8n.');
  }
}

// Executar o teste
testN8nConnection();