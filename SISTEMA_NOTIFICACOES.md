# Sistema de Notificações e Pagamentos - LinkFlow SaaS

## 📧 SMTP (Email)

### Para que serve?
O SMTP na aplicação é usado para enviar **notificações automáticas** aos usuários sobre:

1. **Boas-vindas e Onboarding**
   - Email de confirmação de cadastro
   - Instruções de uso da plataforma
   - Link de ativação de conta

2. **Pagamentos e Assinaturas**
   - Confirmação de pagamento bem-sucedido
   - Falha no pagamento (cartão recusado, saldo insuficiente)
   - Aviso de plano próximo ao vencimento (7 dias antes)
   - Aviso de plano vencido (após data de cobrança)
   - Confirmação de renovação automática
   - Cancelamento de assinatura

3. **Limites e Uso**
   - Aviso quando está próximo do limite de grupos (80% do limite)
   - Aviso quando está próximo do limite de links mensais (80% do limite)
   - Aviso quando limite foi atingido

4. **Segurança**
   - Reset de senha
   - Login de novo dispositivo
   - Alteração de email

5. **Suporte**
   - Respostas a tickets de suporte
   - Atualizações de status de tickets

### Configuração Atual
- **SMTP Host**: `smtp.resend.com` (Recomendado: Resend.com)
- **Porta**: `587` (TLS)
- **From**: `noreply@linkflow.com`
- **Configuração**: Disponível em `/admin/configuracoes`

### Como funciona?
```typescript
// Exemplo de envio de email
import { sendEmail } from '@/lib/email'

await sendEmail({
  to: user.email,
  subject: 'Seu plano está próximo ao vencimento',
  html: `
    <h1>Olá ${user.name}!</h1>
    <p>Seu plano ${plan.name} vence em 7 dias.</p>
    <p>Renove agora para continuar usando o LinkFlow.</p>
    <a href="${appUrl}/checkout?plan=${plan.id}">Renovar Plano</a>
  `
})
```

---

## 💳 Gateway de Pagamento (AbacatePay)

### Como funciona a verificação de planos vencidos?

#### 1. **Webhook do AbacatePay**
O AbacatePay envia webhooks para `/api/webhooks/abacatepay` quando eventos ocorrem:

**Eventos importantes:**
- `payment.succeeded` - Pagamento bem-sucedido
- `payment.failed` - Pagamento falhou
- `subscription.created` - Nova assinatura criada
- `subscription.activated` - Assinatura ativada
- `subscription.cancelled` - Assinatura cancelada
- `subscription.expired` - Assinatura expirada
- `subscription.updated` - Assinatura atualizada

#### 2. **Verificação Automática (Cron Job)**
**⚠️ AINDA NÃO IMPLEMENTADO** - Precisa ser criado:

```typescript
// src/app/api/cron/check-expired-subscriptions/route.ts
// Executa diariamente às 00:00 UTC

export async function GET(request: NextRequest) {
  // Verificar se é chamado pela Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  
  // Buscar empresas com plano vencido ou próximo ao vencimento
  const today = new Date()
  const sevenDaysFromNow = new Date(today)
  sevenDaysFromNow.setDate(today.getDate() + 7)

  // 1. Verificar planos que venceram (past_due)
  const { data: expiredCompanies } = await supabase
    .from('companies_view')
    .select('*, users!inner(email, name)')
    .eq('subscription_status', 'past_due')
    .or('subscription_status.eq.trial,subscription_status.is.null')

  // 2. Enviar notificações
  for (const company of expiredCompanies || []) {
    // Email
    await sendEmail({
      to: company.users[0].email,
      subject: '⚠️ Seu plano LinkFlow expirou',
      html: `
        <h1>Olá ${company.users[0].name}!</h1>
        <p>Seu plano expirou e seus links foram desativados.</p>
        <p>Renove agora para continuar usando:</p>
        <a href="${appUrl}/checkout">Renovar Plano</a>
      `
    })

    // WhatsApp (opcional - via API do WhatsApp Business)
    await sendWhatsAppNotification({
      to: company.phone, // Número do dono da empresa
      message: `⚠️ Seu plano LinkFlow expirou. Renove em: ${appUrl}/checkout`
    })

    // Desativar grupos e números
    await supabase
      .from('groups')
      .update({ is_active: false })
      .eq('company_id', company.id)
  }

  return NextResponse.json({ success: true })
}
```

#### 3. **Fluxo de Verificação**

```
┌─────────────────────────────────────┐
│  AbacatePay detecta pagamento falho │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Envia webhook: payment.failed      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  /api/webhooks/abacatepay           │
│  Atualiza subscription_status        │
│  para 'past_due'                     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Cron Job diário verifica           │
│  empresas com status 'past_due'     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Envia notificações:                │
│  - Email de aviso                   │
│  - WhatsApp (opcional)              │
│  - Desativa grupos/números         │
└─────────────────────────────────────┘
```

---

## 📱 WhatsApp Notifications

### Quando enviar?
1. **Pagamento falhou** - "Seu pagamento falhou. Renove em: [link]"
2. **Plano vencido** - "Seu plano expirou. Seus links foram desativados."
3. **Limite atingido** - "Você atingiu seu limite de grupos. Faça upgrade!"
4. **Boas-vindas** - "Bem-vindo ao LinkFlow! Seu primeiro grupo está pronto."

### Como implementar?
```typescript
// src/lib/whatsapp.ts
import { createClient } from '@supabase/supabase-js'

export async function sendWhatsAppNotification({
  to,
  message
}: {
  to: string
  message: string
}) {
  // Opção 1: WhatsApp Business API (oficial)
  // Opção 2: Twilio WhatsApp API
  // Opção 3: Evolution API (não oficial, mas funciona)
  
  // Exemplo com Evolution API:
  const response = await fetch(`${process.env.WHATSAPP_API_URL}/message/sendText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.WHATSAPP_API_KEY
    },
    body: JSON.stringify({
      number: to,
      text: message
    })
  })
  
  return response.json()
}
```

---

## 🔔 Sistema de Notificações Completo

### Estrutura Recomendada

```
src/
├── lib/
│   ├── email.ts          # Funções de envio de email
│   ├── whatsapp.ts       # Funções de envio WhatsApp
│   └── notifications.ts  # Orquestrador de notificações
├── app/
│   ├── api/
│   │   ├── cron/
│   │   │   ├── check-expired-subscriptions/
│   │   │   ├── check-trial-expiring/
│   │   │   └── check-usage-limits/
│   │   └── notifications/
│   │       ├── send-email/
│   │       └── send-whatsapp/
│   └── webhooks/
│       └── abacatepay/
```

### Templates de Email

```typescript
// src/lib/email-templates.ts

export const emailTemplates = {
  paymentFailed: (user: User, company: Company) => ({
    subject: '⚠️ Pagamento não processado - LinkFlow',
    html: `
      <h1>Olá ${user.name}!</h1>
      <p>O pagamento da sua assinatura LinkFlow não foi processado.</p>
      <p><strong>Empresa:</strong> ${company.name}</p>
      <p><strong>Motivo:</strong> Cartão recusado ou saldo insuficiente</p>
      <a href="${appUrl}/checkout?plan=${company.plan_type}">Atualizar Método de Pagamento</a>
    `
  }),
  
  subscriptionExpired: (user: User, company: Company) => ({
    subject: '🔒 Seu plano LinkFlow expirou',
    html: `
      <h1>Olá ${user.name}!</h1>
      <p>Seu plano <strong>${company.plan_type}</strong> expirou.</p>
      <p>Seus grupos e links foram temporariamente desativados.</p>
      <a href="${appUrl}/checkout">Renovar Plano</a>
    `
  }),
  
  trialExpiring: (user: User, daysLeft: number) => ({
    subject: `⏰ Seu trial expira em ${daysLeft} dias`,
    html: `
      <h1>Olá ${user.name}!</h1>
      <p>Seu período de trial expira em <strong>${daysLeft} dias</strong>.</p>
      <p>Escolha um plano para continuar usando o LinkFlow:</p>
      <a href="${appUrl}/checkout">Ver Planos</a>
    `
  })
}
```

---

## ⚙️ Configuração na Vercel

### Cron Jobs (Vercel Pro)

Adicione em `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-expired-subscriptions",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/check-trial-expiring",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/check-usage-limits",
      "schedule": "0 10 * * *"
    }
  ]
}
```

---

## 📋 Checklist de Implementação

### Fase 1: Email (Prioritário)
- [ ] Configurar SMTP (Resend.com recomendado)
- [ ] Criar templates de email
- [ ] Implementar função `sendEmail()`
- [ ] Adicionar envio no webhook de pagamento falho
- [ ] Adicionar envio no webhook de assinatura expirada

### Fase 2: Cron Jobs
- [ ] Criar cron job para verificar planos vencidos
- [ ] Criar cron job para avisar trial expirando
- [ ] Criar cron job para verificar limites de uso
- [ ] Configurar cron jobs na Vercel

### Fase 3: WhatsApp (Opcional)
- [ ] Escolher provedor (Evolution API, Twilio, etc.)
- [ ] Implementar função `sendWhatsAppNotification()`
- [ ] Adicionar envio de WhatsApp nas notificações críticas

### Fase 4: Testes
- [ ] Testar envio de email
- [ ] Testar webhook do AbacatePay
- [ ] Testar cron jobs
- [ ] Testar desativação de grupos quando plano expira

---

## 🔐 Variáveis de Ambiente Necessárias

```env
# Email (Resend)
RESEND_API_KEY=re_xxxxx
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_FROM=noreply@linkflow.com

# WhatsApp (Opcional)
WHATSAPP_API_URL=https://api.evolutionapi.com
WHATSAPP_API_KEY=xxxxx

# Cron Jobs
CRON_SECRET=seu-secret-aqui

# AbacatePay
ABACATEPAY_WEBHOOK_SECRET=xxxxx
```

---

## 📚 Recursos Recomendados

- **Resend.com** - Email transacional (grátis até 3.000 emails/mês)
- **Evolution API** - WhatsApp Business API não oficial
- **Twilio** - WhatsApp Business API oficial
- **Vercel Cron** - Cron jobs serverless (Vercel Pro)

---

**Status Atual**: ⚠️ Sistema de notificações ainda não implementado completamente. Webhook do AbacatePay está funcional, mas falta:
- Cron jobs para verificação automática
- Sistema de envio de email
- Sistema de envio de WhatsApp
- Templates de notificação

