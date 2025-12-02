# 🔐 Credenciais de Usuários de Teste

## Usuários Criados

### 1. 👤 Usuário Admin (Plano Anual)
**Email:** `admin@linkflow.com`  
**Senha:** `admin123`  
**Empresa:** Admin Company  
**Plano:** Annual  
**Role:** Owner

---

### 2. 💳 Usuário Plano Mensal
**Email:** `mensal@linkflow.com`  
**Senha:** `mensal123`  
**Empresa:** Empresa Mensal  
**Slug:** `empresa-mensal`  
**Plano:** Monthly  
**Status:** Active  
**Role:** Owner

**Limites do Plano Mensal:**
- 10 grupos
- 1.000 links/mês
- 5 membros da equipe
- Analytics completo (30 dias)
- Domínio customizado
- Acesso API
- Suporte prioritário

---

### 3. 🎯 Usuário Plano Anual
**Email:** `anual@linkflow.com`  
**Senha:** `anual123`  
**Empresa:** Empresa Anual  
**Slug:** `empresa-anual`  
**Plano:** Annual  
**Status:** Active  
**Role:** Owner

**Limites do Plano Anual:**
- 50 grupos
- 10.000 links/mês
- 20 membros da equipe
- Analytics avançado (90 dias)
- Domínio customizado
- Acesso API
- White Label
- Suporte prioritário

---

## Como Acessar

1. Acesse: `https://linkflowsaas.vercel.app/login` (ou sua URL de produção)
2. Faça login com uma das credenciais acima
3. Você será redirecionado para `/dashboard/grupos`

## URLs Importantes

- **Login:** `/login`
- **Dashboard:** `/dashboard/grupos`
- **Números:** `/dashboard/numeros`
- **Relatórios:** `/dashboard/relatorios`
- **Painel Admin:** `/admin` (apenas para admin@linkflow.com)

## ⚠️ Segurança

**IMPORTANTE:** 
- Estas são credenciais de teste
- Altere as senhas após o primeiro acesso em produção
- Use senhas fortes em ambiente de produção
- Mantenha essas credenciais seguras

## 📝 Notas

- Todos os usuários estão com `is_active = true`
- Todos têm role `owner` (proprietário da empresa)
- As empresas estão com `subscription_status = 'active'`
- Os planos estão configurados corretamente (`monthly` e `annual`)

