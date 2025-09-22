import { NextRequest, NextResponse } from 'next/server';
import { callN8nWebhook, validateN8nCredentials } from '@/lib/n8n';

// Configurações de segurança
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  console.log('🚀 === INICIANDO EXTRAÇÃO DE TEXTO COM N8N ===');
  
  try {
    // Verificar se as credenciais estão configuradas e válidas
    const credentialsCheck = validateN8nCredentials();
    if (!credentialsCheck.valid) {
      console.error('❌ Credenciais do n8n inválidas:', credentialsCheck.error);
      return NextResponse.json(
        { error: `Configuração inválida: ${credentialsCheck.error}. Configure as variáveis N8N_* no arquivo .env.local` },
        { status: 500 }
      );
    }

    console.log('✅ Credenciais validadas');

    // Adicionar headers de segurança
    const responseHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    };

    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      console.error('❌ Nenhuma imagem fornecida');
      return NextResponse.json(
        { error: 'É necessário fornecer uma imagem' },
        { status: 400, headers: responseHeaders }
      );
    }

    // Validar tipo MIME
    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      console.error(`❌ Tipo de arquivo não permitido: ${imageFile.type}`);
      return NextResponse.json(
        { error: `Tipo de arquivo não permitido. Use apenas: ${ALLOWED_MIME_TYPES.join(', ')}` },
        { status: 400, headers: responseHeaders }
      );
    }

    // Validar tamanho
    if (imageFile.size > MAX_FILE_SIZE) {
      console.error(`❌ Arquivo muito grande: ${imageFile.size} bytes`);
      return NextResponse.json(
        { error: `Arquivo muito grande. O tamanho máximo é ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400, headers: responseHeaders }
      );
    }

    // Converter imagem para base64
    const imageBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const mimeType = imageFile.type;
    const imageBase64 = `data:${mimeType};base64,${base64Image}`;

    // Chamar o webhook do n8n para OCR
    console.log('🔄 Enviando imagem para o n8n (OCR)...');
    const n8nResponse = await callN8nWebhook({
      imageBase64,
      ocr: true // Flag para indicar que é uma operação de OCR
    });

    if (!n8nResponse.success) {
      console.error('❌ Erro na resposta do n8n:', n8nResponse.error);
      return NextResponse.json(
        { error: n8nResponse.error || 'Erro ao extrair texto da imagem' },
        { status: 500, headers: responseHeaders }
      );
    }

    console.log('✅ Resposta do n8n recebida com sucesso');
    
    // Retornar o texto extraído
    return NextResponse.json({
      extractedText: n8nResponse.data.extractedText || '',
      success: true
    }, { 
      status: 200, 
      headers: responseHeaders 
    });
  } catch (error) {
    console.error('❌ Erro no processamento:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro desconhecido no processamento' },
      { status: 500 }
    );
  }
}