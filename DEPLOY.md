# 🚀 Reditto - Deploy na Vercel

## 📋 Configuração para Deploy

### 1. Variáveis de Ambiente na Vercel

Configure as seguintes variáveis de ambiente no painel da Vercel:

```bash
# OpenRouter API Key
OPENROUTER_API_KEY=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

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://imrqgircligznruvudpf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltcnFnaXJjbGlnem5ydXZ1ZHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTg2OTEsImV4cCI6MjA3MjY3NDY5MX0.O3VORx2CCGdvaQ004ACIme32Y1dlx5S2PjbudxaCNrUs

# Configurações do servidor
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 2. Como Configurar na Vercel

1. Acesse o painel da Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione cada variável acima
4. Certifique-se de que estão marcadas para **Production**, **Preview** e **Development**

### 3. Build Settings

A Vercel detectará automaticamente que é um projeto Next.js e usará:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Troubleshooting

Se o deploy falhar:

1. **Verifique as variáveis de ambiente** - Certifique-se de que todas estão configuradas
2. **Verifique os logs de build** - Procure por erros específicos
3. **Teste localmente** - Execute `npm run build` localmente primeiro
4. **Verifique o Supabase** - Certifique-se de que o projeto está ativo

### 5. Estrutura do Projeto

```
reditto-next/
├── src/
│   ├── app/                 # App Router do Next.js
│   ├── components/          # Componentes React
│   ├── contexts/           # Contextos (Auth)
│   ├── lib/                # Utilitários (Supabase)
│   └── types/              # Tipos TypeScript
├── public/                  # Arquivos estáticos
├── vercel.json             # Configuração da Vercel
├── next.config.ts          # Configuração do Next.js
└── package.json            # Dependências
```

### 6. Funcionalidades

✅ **Autenticação Supabase** - Login e cadastro funcionais
✅ **Correção de Redações** - Integração com OpenRouter AI
✅ **Histórico de Redações** - Armazenamento no banco de dados
✅ **Interface Responsiva** - Design moderno e mobile-first
✅ **Segurança** - Rate limiting e headers de segurança

### 7. URLs Importantes

- **Supabase Dashboard**: https://supabase.com/dashboard/project/imrqgircligznruvudpf
- **OpenRouter**: https://openrouter.ai/keys
- **Vercel Dashboard**: https://vercel.com/dashboard

---

**🎉 Deploy pronto!** Após configurar as variáveis de ambiente, o deploy deve funcionar perfeitamente.
