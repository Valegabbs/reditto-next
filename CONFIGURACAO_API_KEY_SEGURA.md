# 🔐 GUIA DE CONFIGURAÇÃO SEGURA - API KEY OPENROUTER

## ⚠️ **IMPORTANTE: SEGURANÇA MÁXIMA**

Sua API Key é um dado **CRÍTICO** e deve ser protegida com máxima segurança!

## 📋 **PASSOS PARA CONFIGURAR:**

### **1. Obter API Key do OpenRouter**

1. **Acesse**: https://openrouter.ai/keys
2. **Faça login** ou crie uma conta
3. **Clique em "Create Key"**
4. **Copie a chave** (formato: `sk-or-v1-...`)

### **2. Configurar no Projeto**

**IMPORTANTE**: Substitua `your_openrouter_api_key_here` pela sua chave real no arquivo `.env.local`

```env
# Variáveis de ambiente para o Reditto
OPENROUTER_API_KEY=sk-or-v1-sua_chave_real_aqui
NEXT_PUBLIC_SUPABASE_URL=https://imrqgircligznruvudpf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltcnFnaXJjbGlnem5ydXZ1ZHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTg2OTEsImV4cCI6MjA3MjY3NDY5MX0.O3VORx2CCGdvaQ004ACIme32Y1dlx5S2PjbudxaCNrUs
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **3. Verificar Configuração**

Após configurar, reinicie o servidor:
```bash
npm run dev
```

## 🛡️ **MEDIDAS DE SEGURANÇA IMPLEMENTADAS:**

### ✅ **Proteção da API Key:**
- Armazenada apenas no servidor (`process.env`)
- Nunca exposta no frontend
- Validação automática de configuração
- Logs mascarados (mostra apenas primeiros 20 caracteres)

### ✅ **Validações de Entrada:**
- Texto: 200-5000 caracteres
- Imagem: máx 10MB, tipos permitidos
- Sanitização de caracteres perigosos
- Rate limiting: 20 req/min por IP

### ✅ **Headers de Segurança:**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Content Security Policy (CSP)

### ✅ **Tratamento de Erros:**
- Não vaza informações sensíveis
- Mensagens de erro seguras
- Logs detalhados para debug

## 🚨 **REGRAS DE SEGURANÇA:**

1. **NUNCA** compartilhe sua API Key
2. **NUNCA** commite o arquivo `.env.local`
3. **NUNCA** exponha a chave no frontend
4. **SEMPRE** use HTTPS em produção
5. **MONITORE** o uso da API Key

## 🔍 **COMO VERIFICAR SE ESTÁ FUNCIONANDO:**

1. Configure a API Key
2. Reinicie o servidor: `npm run dev`
3. Acesse: http://localhost:3000/envio
4. Teste uma redação
5. Verifique os logs do console

## 📊 **STATUS ATUAL:**

- ✅ Arquivo `.env.local` existe
- ❌ API Key não configurada (ainda com valor padrão)
- ✅ Todas as validações de segurança implementadas
- ✅ Rate limiting ativo
- ✅ Headers de segurança configurados

## 🎯 **PRÓXIMO PASSO:**

Substitua `your_openrouter_api_key_here` pela sua chave real do OpenRouter!
