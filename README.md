# Redigitto - Correção de Redação para Todos!

Uma plataforma moderna de correção de redações utilizando IA, desenvolvida com Next.js e integração com OpenRouter.

## 🚀 Funcionalidades

- **Página Inicial**: Sistema de login/cadastro com opção de acesso como visitante
- **Página de Envio**: Envio de redações por texto ou imagem (OCR)
- **Página de Resultados**: Análise detalhada seguindo critérios do ENEM
- **Análise por IA**: Correção automática usando OpenRouter API
- **OCR**: Extração de texto de imagens de redações
- **Design Responsivo**: Interface moderna e adaptável

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React
- **IA**: OpenRouter API (GPT-4o)
- **OCR**: OpenRouter Vision API

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no OpenRouter (https://openrouter.ai)

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd reditto-next
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` e adicione sua API Key do OpenRouter:
```
OPENROUTER_API_KEY=sua_chave_api_aqui
```

4. **Execute o projeto**
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## 🔑 Configuração da API

1. Acesse [OpenRouter](https://openrouter.ai)
2. Crie uma conta e obtenha sua API Key
3. Adicione a chave no arquivo `.env.local`

## 📱 Como Usar

### Página Inicial (/)
- **Criar Conta**: Cadastro com email e senha
- **Entrar com Email**: Login com credenciais existentes
- **Entrar como Visitante**: Acesso sem cadastro

### Página de Envio (/envio)
- **Tema**: Campo opcional para especificar o tema
- **Método de Envio**: 
  - **Texto**: Cole diretamente o texto da redação
  - **Imagem**: Faça upload de uma foto da redação
- **Limites**: Mínimo 200, máximo 5.000 caracteres

### Página de Resultados (/resultados)
- **Nota Final**: Pontuação de 0 a 1000
- **Competências**: Análise das 5 competências do ENEM
- **Feedback Detalhado**: Pontos de melhoria, atenção e parabéns
- **Ações**: Nova redação ou imprimir resultado

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   └── correct-essay/
│   │       └── route.ts          # API de correção
│   ├── envio/
│   │   └── page.tsx              # Página de envio
│   ├── resultados/
│   │   └── page.tsx              # Página de resultados
│   ├── globals.css               # Estilos globais
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página inicial
├── components/                   # Componentes reutilizáveis
└── types/                       # Definições de tipos
```

## 🔒 Segurança

- API Keys mantidas no lado do servidor
- Validação de entrada em todas as rotas
- Sanitização de dados
- Rate limiting recomendado para produção

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras Plataformas
- Configure as variáveis de ambiente
- Execute `npm run build`
- Inicie com `npm start`

## 📝 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
