import { NextRequest, NextResponse } from 'next/server';

// Configurações de segurança - API Key protegida no servidor
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Configurações de segurança para OCR
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Validação adicional da API Key
function validateApiKey(): boolean {
  if (!OPENROUTER_API_KEY) return false;
  if (OPENROUTER_API_KEY === 'your_openrouter_api_key_here') return false;
  if (OPENROUTER_API_KEY.length < 20) return false;
  if (!OPENROUTER_API_KEY.startsWith('sk-or-')) return false;
  return true;
}

async function extractTextFromImage(imageBuffer: Buffer, originalMimeType?: string): Promise<string> {
  console.log('🔍 Iniciando extração de texto da imagem...');
  
  try {
    const base64Image = imageBuffer.toString('base64');
    // Detectar tipo MIME correto baseado no tipo original ou usar JPEG como fallback
    let mimeType = originalMimeType || 'image/jpeg';
    
    // Normalizar tipos MIME
    if (mimeType === 'image/jpg') mimeType = 'image/jpeg';
    
    console.log('📝 Enviando requisição para OpenRouter (Gemini OCR)...');
    console.log('🎯 Tipo MIME:', mimeType);
    console.log('📦 Tamanho da imagem (base64):', base64Image.length);
    
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://redigitto.com",
        "X-Title": "Redigitto - OCR de Redação",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-exp:free",
        "messages": [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": "Extraia todo o texto desta imagem de redação com máxima precisão. Mantenha a formatação original, preservando quebras de linha e parágrafos. Retorne APENAS o texto extraído, sem comentários, explicações ou formatação adicional."
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        "max_tokens": 3000,
        "temperature": 0.1
      })
    });

    console.log('📊 Status da resposta OCR:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Erro na API de OCR:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // Mensagens de erro mais específicas
      let errorMessage = 'Erro na API de OCR';
      if (response.status === 401) {
        errorMessage = 'API Key inválida ou expirada';
      } else if (response.status === 429) {
        errorMessage = 'Muitas requisições. Tente novamente em alguns minutos';
      } else if (response.status === 400) {
        errorMessage = `Erro na requisição: ${errorData.error?.message || 'Dados inválidos'}`;
      } else if (response.status >= 500) {
        errorMessage = 'Servidor da OpenRouter temporariamente indisponível';
      }
      
      throw new Error(`${errorMessage} (${response.status})`);
    }

    const data = await response.json();
    console.log('✅ Resposta OCR recebida');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Estrutura de resposta inválida:', data);
      throw new Error('Resposta inválida da API de OCR');
    }

    const extractedText = data.choices[0].message.content;
    console.log('📄 Texto extraído (comprimento):', extractedText?.length || 0);
    
    return extractedText || '';
    
  } catch (error) {
    console.error('❌ Erro completo no OCR:', error);
    throw new Error(`Falha ao extrair texto da imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 === INICIANDO PROCESSAMENTO DE OCR ===');
  console.log('🔑 API Key status:', OPENROUTER_API_KEY ? `Configurada (${OPENROUTER_API_KEY.substring(0, 20)}...)` : 'NÃO CONFIGURADA');
  
  try {
    // Verificar se a API key está configurada e válida
    if (!validateApiKey()) {
      console.error('❌ API Key do OpenRouter inválida ou não configurada');
      return NextResponse.json(
        { error: 'API Key do OpenRouter não configurada. Configure OPENROUTER_API_KEY no arquivo .env.local' },
        { status: 500 }
      );
    }

    console.log('✅ API Key configurada');

    // Adicionar headers de segurança
    const responseHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    };

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    console.log('🖼️ Processando envio por imagem...');
    
    // Validações de segurança para imagem
    if (!imageFile) {
      console.error('❌ Imagem não fornecida');
      return NextResponse.json(
        { error: 'Imagem não fornecida' },
        { status: 400, headers: responseHeaders }
      );
    }
    
    console.log('📊 Detalhes da imagem:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type
    });
    
    if (imageFile.size > MAX_FILE_SIZE) {
      console.error('❌ Imagem muito grande:', imageFile.size);
      return NextResponse.json(
        { error: 'Imagem deve ter no máximo 10MB' },
        { status: 400, headers: responseHeaders }
      );
    }
    
    if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
      console.error('❌ Tipo de imagem inválido:', imageFile.type);
      return NextResponse.json(
        { error: 'Tipo de imagem não suportado. Use PNG, JPG, JPEG ou WEBP' },
        { status: 400, headers: responseHeaders }
      );
    }

    console.log('✅ Imagem validada, iniciando OCR...');
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const extractedText = await extractTextFromImage(imageBuffer, imageFile.type);
    
    if (!extractedText || extractedText.trim().length < 50) {
      console.error('❌ Texto extraído insuficiente:', extractedText?.length || 0);
      return NextResponse.json(
        { error: 'Não foi possível extrair texto suficiente da imagem. Tente uma imagem com melhor qualidade e texto mais legível.' },
        { status: 400, headers: responseHeaders }
      );
    }
    
    console.log('🎉 === OCR CONCLUÍDO COM SUCESSO ===');
    
    // Retornar apenas o texto extraído
    return NextResponse.json(
      { extractedText: extractedText.trim() }, 
      { headers: responseHeaders }
    );
    
  } catch (error) {
    console.error('❌ === ERRO NO PROCESSAMENTO OCR ===');
    console.error('Erro completo:', error);
    
    // Log detalhado do erro
    if (error instanceof Error) {
      console.error('Tipo de erro:', error.constructor.name);
      console.error('Mensagem:', error.message);
      console.error('Stack trace:', error.stack);
    }
    
    // Não expor detalhes do erro para o cliente
    const errorMessage = error instanceof Error && error.message.includes('API') 
      ? 'Erro na comunicação com o serviço de OCR. Tente novamente em alguns minutos.'
      : 'Erro interno do servidor. Tente novamente.';
    
    return NextResponse.json(
      { error: errorMessage },
      { 
        status: 500,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
        }
      }
    );
  }
}
