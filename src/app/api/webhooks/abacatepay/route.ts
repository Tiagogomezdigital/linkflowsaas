import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { DEFAULT_LIMITS } from '@/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Webhook do AbacatePay para processar pagamentos
// Documentação: https://docs.abacatepay.com/webhooks

export async function POST(request: NextRequest) {
  try {
    // Verificar assinatura do webhook (implementar validação real)
    const signature = request.headers.get('x-abacatepay-signature')
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    // TODO: Validar assinatura do webhook
    // const isValid = verifyAbacatePaySignature(body, signature)
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const body = await request.json()
    const { event, data } = body

    const supabase = createServiceRoleClient()

    // Processar diferentes tipos de eventos
    switch (event) {
      case 'payment.succeeded':
      case 'subscription.created':
      case 'subscription.activated': {
        // Atualizar status da assinatura
        const {
          customer_id,
          subscription_id,
          plan_type, // 'monthly' ou 'annual'
          company_id, // ID da empresa que foi criada no signup
        } = data

        if (!customer_id || !subscription_id || !company_id) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          )
        }

        // Atualizar empresa com IDs do AbacatePay
        const { error: updateError } = await supabase
          .from('companies')
          .update({
            abacatepay_customer_id: customer_id,
            abacatepay_subscription_id: subscription_id,
            plan_type: plan_type || 'monthly',
            subscription_status: 'active',
          })
          .eq('id', company_id)

        if (updateError) {
          console.error('Error updating company:', updateError)
          return NextResponse.json(
            { error: 'Failed to update company' },
            { status: 500 }
          )
        }

        // Atualizar tenant_limits se necessário
        if (plan_type) {
          const limits = plan_type === 'monthly' 
            ? DEFAULT_LIMITS.monthly
            : DEFAULT_LIMITS.annual

          // Buscar plan_id
          const { data: plan } = await supabase
            .from('subscription_plans')
            .select('id')
            .eq('billing_cycle', plan_type === 'monthly' ? 'monthly' : 'yearly')
            .eq('is_active', true)
            .single()

          if (plan) {
            await supabase
              .from('tenant_limits')
              .update({
                plan_id: plan.id,
                max_groups: limits.maxGroups,
                max_links_per_month: limits.maxLinksPerMonth,
                max_custom_domains: limits.maxCustomDomains,
                max_team_members: limits.maxTeamMembers,
              })
              .eq('company_id', company_id)
          }
        }

        return NextResponse.json({ success: true })
      }

      case 'payment.failed':
      case 'subscription.cancelled':
      case 'subscription.expired': {
        const { subscription_id, company_id } = data

        if (!subscription_id || !company_id) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          )
        }

        // Atualizar status da assinatura
        await supabase
          .from('companies')
          .update({
            subscription_status: event.includes('cancelled') ? 'canceled' : 'past_due',
          })
          .eq('id', company_id)

        return NextResponse.json({ success: true })
      }

      case 'subscription.updated': {
        // Atualizar plano ou período
        const { subscription_id, company_id, plan_type } = data

        if (plan_type && company_id) {
          const limits = plan_type === 'monthly' 
            ? DEFAULT_LIMITS.monthly
            : DEFAULT_LIMITS.annual

          await supabase
            .from('companies')
            .update({ plan_type })
            .eq('id', company_id)

          // Atualizar limites
          const { data: plan } = await supabase
            .from('subscription_plans')
            .select('id')
            .eq('billing_cycle', plan_type === 'monthly' ? 'monthly' : 'yearly')
            .eq('is_active', true)
            .single()

          if (plan) {
            await supabase
              .from('tenant_limits')
              .update({
                plan_id: plan.id,
                max_groups: limits.maxGroups,
                max_links_per_month: limits.maxLinksPerMonth,
                max_custom_domains: limits.maxCustomDomains,
                max_team_members: limits.maxTeamMembers,
              })
              .eq('company_id', company_id)
          }
        }

        return NextResponse.json({ success: true })
      }

      default:
        // Evento desconhecido - apenas logar
        console.log('Unknown webhook event:', event, data)
        return NextResponse.json({ success: true, message: 'Event logged' })
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET para verificação do webhook (ping)
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'AbacatePay webhook endpoint is active' 
  })
}

