# 🚀 Deploy na Vercel - LinkFlow SaaS

## Opção 1: Via Interface Web (Mais Fácil)

1. **Acesse:** https://vercel.com/new
2. **Conecte seu repositório GitHub:**
   - Clique em "Import Project"
   - Selecione o repositório: `gestao-design/linkflowsaas`
   - Ou cole a URL: `https://github.com/gestao-design/linkflowsaas`

3. **Configure o projeto:**
   - **Project Name:** `linkflowsaas`
   - **Framework Preset:** Next.js (detectado automaticamente)
   - **Root Directory:** `./` (raiz)
   - **Build Command:** `npm run build` (automático)
   - **Output Directory:** `.next` (automático)
   - **Install Command:** `npm install` (automático)

4. **Configure as Variáveis de Ambiente:**
   Clique em "Environment Variables" e adicione:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
   JWT_SECRET=sua_chave_secreta_min_32_caracteres
   NEXT_PUBLIC_APP_URL=https://linkflowsaas.vercel.app
   ```

5. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build completar
   - Sua aplicação estará em: `https://linkflowsaas.vercel.app`

## Opção 2: Via CLI (Terminal)

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Ou usar npx (sem instalar)
npx vercel@latest

# Fazer login
vercel login

# Deploy
vercel

# Deploy em produção
vercel --prod
```

## Opção 3: Integração com GitHub (Automático)

1. **Conecte o repositório na Vercel:**
   - Vá em: https://vercel.com/dashboard
   - Clique em "Add New Project"
   - Conecte o repositório `gestao-design/linkflowsaas`

2. **Configure as variáveis de ambiente** (mesmas do passo 4 acima)

3. **A cada push no GitHub, a Vercel fará deploy automaticamente!**

## 📋 Variáveis de Ambiente Necessárias

Certifique-se de configurar todas estas variáveis na Vercel:

| Variável | Descrição | Onde encontrar |
|----------|-----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do seu projeto Supabase | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de service role | Supabase Dashboard → Settings → API |
| `JWT_SECRET` | Chave secreta para JWT (min 32 chars) | Gere uma chave aleatória |
| `NEXT_PUBLIC_APP_URL` | URL da aplicação na Vercel | Será gerada após o deploy |

## ✅ Após o Deploy

1. Acesse sua aplicação: `https://linkflowsaas.vercel.app`
2. Configure domínio customizado (opcional): Vercel Dashboard → Settings → Domains
3. Monitore logs: Vercel Dashboard → Deployments → [seu deploy] → Logs

## 🔗 Links Úteis

- Dashboard Vercel: https://vercel.com/dashboard
- Documentação: https://vercel.com/docs
- Status do Deploy: https://vercel.com/dashboard


