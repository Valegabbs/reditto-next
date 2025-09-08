import { NextRequest, NextResponse } from 'next/server';

interface EssayResult {
  finalScore: number;
  competencies: {
    [key: string]: number;
  };
  feedback: {
    summary: string;
    improvements: string[];
    attention: string[];
    congratulations: string[];
    competencyFeedback: {
      [key: string]: string;
    };
  };
  originalEssay: string;
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://reditto.com',
        'X-Title': 'Reditto OCR'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extraia o texto desta imagem de redação. Retorne apenas o texto puro, sem formatação adicional.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error('Erro na API de OCR');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Erro no OCR:', error);
    throw new Error('Falha ao extrair texto da imagem');
  }
}

async function analyzeEssay(essayText: string, topic?: string): Promise<EssayResult> {
  try {
    const prompt = `
Analise esta redação seguindo os critérios do ENEM e retorne um JSON com a seguinte estrutura:

{
  "finalScore": número de 0 a 1000,
  "competencies": {
    "Competência I": número de 0 a 200,
    "Competência II": número de 0 a 200,
    "Competência III": número de 0 a 200,
    "Competência IV": número de 0 a 200,
    "Competência V": número de 0 a 200
  },
  "feedback": {
    "summary": "resumo geral da correção",
    "improvements": ["ponto 1", "ponto 2", "ponto 3"],
    "attention": ["atenção 1", "atenção 2", "atenção 3"],
    "congratulations": ["parabéns 1", "parabéns 2", "parabéns 3"],
    "competencyFeedback": {
      "Competência I": "feedback específico",
      "Competência II": "feedback específico",
      "Competência III": "feedback específico",
      "Competência IV": "feedback específico",
      "Competência V": "feedback específico"
    }
  }
}

Tema da redação: ${topic || 'Não especificado'}

Redação:
${essayText}

Competências ENEM:
- Competência I: Modalidade escrita (0-200 pontos)
- Competência II: Compreensão da proposta e aplicação de conceitos (0-200 pontos)
- Competência III: Capacidade de selecionar, relacionar, organizar e interpretar informações (0-200 pontos)
- Competência IV: Conhecimento dos mecanismos linguísticos necessários para a construção da argumentação (0-200 pontos)
- Competência V: Elaboração de proposta de intervenção para o problema abordado (0-200 pontos)

Retorne apenas o JSON válido, sem texto adicional.
`;

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://reditto.com',
        'X-Title': 'Reditto Essay Analysis'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error('Erro na API de análise');
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    // Extrair JSON da resposta
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Resposta inválida da API');
    }

    const analysis: EssayResult = JSON.parse(jsonMatch[0]);
    analysis.originalEssay = essayText;

    return analysis;
  } catch (error) {
    console.error('Erro na análise:', error);
    throw new Error('Falha ao analisar redação');
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'API Key não configurada' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const topic = formData.get('topic') as string;
    const submissionType = formData.get('submissionType') as string;
    let essayText = '';

    if (submissionType === 'text') {
      essayText = formData.get('essayText') as string;
      if (!essayText || essayText.length < 200) {
        return NextResponse.json(
          { error: 'Texto deve ter pelo menos 200 caracteres' },
          { status: 400 }
        );
      }
    } else if (submissionType === 'image') {
      const imageFile = formData.get('image') as File;
      if (!imageFile) {
        return NextResponse.json(
          { error: 'Imagem não fornecida' },
          { status: 400 }
        );
      }

      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      essayText = await extractTextFromImage(imageBuffer);
      
      if (!essayText || essayText.length < 200) {
        return NextResponse.json(
          { error: 'Texto extraído deve ter pelo menos 200 caracteres' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Tipo de envio inválido' },
        { status: 400 }
      );
    }

    const analysis = await analyzeEssay(essayText, topic);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Erro no processamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
