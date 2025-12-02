# 🔧 Configurar Variáveis de Ambiente na Vercel

## Problema
O erro `Environment Variable "NEXT_PUBLIC_SUPABASE_URL" references Secret "supabase_url", which does not exist` ocorre porque o `vercel.json` estava referenciando secrets que não existem.

## ✅ Solução

### 1. Remover referências de secrets do vercel.json
✅ **Já feito!** O `vercel.json` foi atualizado para remover as referências de secrets.

### 2. Configurar variáveis de ambiente no painel da Vercel

1. **Acesse o painel da Vercel:**
   - Vá para: https://vercel.com/dashboard
   - Selecione o projeto `linkflowsaas`

2. **Vá em Settings > Environment Variables:**
   - No menu lateral, clique em **Settings**
   - Clique em **Environment Variables**

3. **Adicione as seguintes variáveis:**

   | Nome da Variável | Valor | Ambiente |
   |-----------------|-------|----------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://okneoxrybknrrawiaopn.supabase.co` | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_DnsKFOvnou_8lkb-qTmxtg_DanAkdsz` | Production, Preview, Development |
   | `SUPABASE_SERVICE_ROLE_KEY` | `[sua service role key do Supabase]` | Production, Preview, Development |
   | `JWT_SECRET` | `[uma chave secreta de pelo menos 32 caracteres]` | Production, Preview, Development |
   | `NEXT_PUBLIC_APP_URL` | `https://linkflowsaas.vercel.app` (ou sua URL) | Production, Preview, Development |

### 3. Como obter a Service Role Key do Supabase

1. Acesse: https://supabase.com/dashboard/project/okneoxrybknrrawiaopn
2. Vá em **Settings** > **API**
3. Copie a **service_role** key (⚠️ **NÃO** a anon key)
4. Cole no campo `SUPABASE_SERVICE_ROLE_KEY` na Vercel

### 4. Gerar JWT_SECRET

Você pode gerar uma chave secreta segura usando:

```bash
# No terminal:
openssl rand -base64 32
```

Ou use qualquer string aleatória de pelo menos 32 caracteres.

### 5. Fazer o deploy novamente

Após configurar todas as variáveis:
1. Vá em **Deployments**
2. Clique em **Create Deployment**
3. Selecione o branch `main`
4. O deploy deve funcionar agora! ✅

## ⚠️ Importante

- **Nunca** commite secrets no código
- Use sempre variáveis de ambiente para valores sensíveis
- A `SUPABASE_SERVICE_ROLE_KEY` tem acesso total ao banco - mantenha segura!

## 📝 Checklist

- [ ] Removido secrets do `vercel.json` ✅
- [ ] Configurado `NEXT_PUBLIC_SUPABASE_URL` na Vercel
- [ ] Configurado `NEXT_PUBLIC_SUPABASE_ANON_KEY` na Vercel
- [ ] Configurado `SUPABASE_SERVICE_ROLE_KEY` na Vercel
- [ ] Configurado `JWT_SECRET` na Vercel
- [ ] Configurado `NEXT_PUBLIC_APP_URL` na Vercel
- [ ] Deploy realizado com sucesso

