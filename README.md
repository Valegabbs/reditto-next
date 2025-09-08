# Reditto - Plataforma de Redação (MVP)

Uma plataforma moderna para prática de redação, desenvolvida com Next.js.

## 🚀 Funcionalidades MVP

- **Página Inicial**: Sistema de login/cadastro com opção de acesso como visitante
- **Página de Envio**: Interface para envio de redações por texto ou imagem
- **Página de Resultados**: Visualização de resultados de correção
- **Design Responsivo**: Interface moderna e adaptável

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React
- **Autenticação**: Supabase (preparado para roadmap)

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn

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

3. **Execute o projeto**
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

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
│   ├── api/                        # APIs do lado do servidor
│   ├── envio/
│   │   └── page.tsx                # Página de envio
│   ├── resultados/
│   │   └── page.tsx                # Página de resultados
│   ├── globals.css                 # Estilos globais
│   └── page.tsx                    # Página inicial
├── components/                     # Componentes reutilizáveis
├── contexts/                       # Contextos React
└── types/                          # Definições de tipos TypeScript
```

## 🚧 Roadmap Futuro

- **Histórico de Redações**: Sistema completo de histórico
- **Evolução do Aluno**: Gráficos e estatísticas de desempenho
- **Barra Lateral**: Interface de navegação avançada
- **Relatórios**: Análises detalhadas de progresso

## 🔒 Segurança

- Rate limiting implementado
- Validação de dados server-side
- Sanitização de inputs
- Headers de segurança