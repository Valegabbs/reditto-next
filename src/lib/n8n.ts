// Serviço de integração com o n8n
// Este serviço substitui a integração anterior com Open WebUI

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '';
const N8N_API_KEY = process.env.NEXT_PUBLIC_N8N_API_KEY || '';
const TIMEOUT_MS = 60000; // 60 segundos

// Validar se as credenciais do n8n estão configuradas
export function validateN8nCredentials() {
  const issues = [];

  if (!N8N_WEBHOOK_URL) {
    issues.push('URL do webhook do n8n não configurada');
  } else if (!N8N_WEBHOOK_URL.includes('webhook')) {
    issues.push('URL do webhook do n8n parece inválida (deve conter "webhook")');
  }

  if (!N8N_API_KEY) {
    issues.push('API Key do n8n não configurada');
  } else if (N8N_API_KEY.length < 20) {
    issues.push('API Key do n8n parece inválida (muito curta)');
  }

  return {
    valid: issues.length === 0,
    error: issues.join(', ')
  };
}

// Interface para a requisição ao n8n
interface N8nRequest {
  text?: string;
  imageBase64?: string;
  topic?: string;
}

// Interface para a resposta do n8n
interface N8nResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Envia uma requisição para o webhook do n8n
 * @param payload Dados a serem enviados para o n8n
 * @returns Resposta do n8n
 */
export async function callN8nWebhook(payload: N8nRequest): Promise<N8nResponse> {
  console.log('🤖 Enviando requisição para n8n...');
  console.log('📍 URL:', N8N_WEBHOOK_URL);
  console.log('💬 Payload:', {
    hasText: !!payload.text,
    hasImage: !!payload.imageBase64,
    topic: payload.topic || 'Não especificado'
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${N8N_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Reditto-Next/1.0'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Erro desconhecido');
      console.error('❌ Erro na resposta do n8n:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      let errorMessage = 'Erro na comunicação com o n8n';
      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Credenciais inválidas para o n8n';
      } else if (response.status === 404 || response.status === 405) {
        errorMessage = 'Webhook não encontrado no n8n';
      } else if (response.status === 429) {
        errorMessage = 'Muitas requisições. Tente novamente em alguns minutos';
      } else if (response.status >= 500) {
        errorMessage = 'Servidor do n8n temporariamente indisponível';
      }
      
      return {
        success: false,
        error: `${errorMessage} (${response.status})`
      };
    }

    const data = await response.json();
    console.log('✅ Resposta recebida do n8n');
    console.log('📄 Estrutura da resposta:', Object.keys(data));

    return {
      success: true,
      data
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('❌ Timeout na requisição para n8n');
      return {
        success: false,
        error: 'Timeout na comunicação com o n8n. Tente novamente.'
      };
    }
    
    console.error('❌ Erro na comunicação com n8n:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}