// Tipos principais do LinkFlow

export interface Company {
  id: string
  name: string
  slug: string
  subscription_status: 'trial' | 'active' | 'canceled' | 'past_due' | null
  plan_type: 'monthly' | 'annual' | null
  abacatepay_customer_id?: string
  abacatepay_subscription_id?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  name: string | null
  company_id: string
  role: 'owner' | 'member'
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface Group {
  id: string
  company_id: string
  name: string
  slug: string
  description?: string
  default_message?: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Campos calculados (join)
  total_numbers?: number
  active_numbers?: number
  total_clicks?: number
}

export interface WhatsAppNumber {
  id: string
  company_id: string
  group_id: string
  phone: string
  name?: string
  custom_message?: string
  is_active: boolean
  last_used_at?: string
  click_count?: number
  created_at: string
  updated_at: string
  // Campos de join
  group?: Group
}

export interface Click {
  id: string
  company_id: string
  group_id: string
  number_id: string
  ip_address?: string
  user_agent?: string
  device_type: 'desktop' | 'mobile' | 'tablet'
  referrer?: string
  created_at: string
}

export interface GroupStats {
  id: string
  name: string
  slug: string
  total_numbers: number
  active_numbers: number
  total_clicks: number
  clicks_today: number
  clicks_this_week: number
  clicks_this_month: number
  last_click_at?: string
}

export interface FilteredStats {
  daily_clicks: Array<{
    date: string
    clicks: number
  }>
  group_ranking: Array<{
    group_id: string
    group_name: string
    clicks: number
  }>
  device_distribution: Array<{
    device_type: string
    count: number
    percentage: number
  }>
  total_clicks: number
}

export interface CustomDomain {
  id: string
  company_id: string
  domain: string
  status: 'pending' | 'verified' | 'failed'
  created_at: string
  updated_at: string
}

// Limites são gerenciados pela tabela tenant_limits no banco
// Estes são valores default para referência
export const DEFAULT_LIMITS = {
  free: {
    maxGroups: 3,
    maxLinksPerMonth: 100,
    maxCustomDomains: 0,
    maxTeamMembers: 1,
  },
  monthly: {
    maxGroups: 10,
    maxLinksPerMonth: 1000,
    maxCustomDomains: 1,
    maxTeamMembers: 5,
  },
  annual: {
    maxGroups: 50,
    maxLinksPerMonth: 10000,
    maxCustomDomains: 5,
    maxTeamMembers: 20,
  },
} as const

export type PlanType = 'monthly' | 'annual' | null
export type SubscriptionStatus = 'trial' | 'active' | 'canceled' | 'past_due' | null
export type UserRole = 'owner' | 'member'

// Interface para subscription_plans (tabela existente)
export interface SubscriptionPlan {
  id: string
  name: string
  description?: string
  price_cents: number
  currency: string
  billing_cycle: 'monthly' | 'yearly' | 'lifetime'
  features: string[]
  limits: Record<string, number>
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// Interface para tenant_limits (tabela existente)
export interface TenantLimits {
  id: string
  company_id: string
  plan_id: string
  max_groups: number
  max_links_per_month: number
  max_custom_domains: number
  max_team_members: number
  current_groups: number
  current_links_this_month: number
  current_custom_domains: number
  current_team_members: number
  month_start_date: string
  last_reset_at?: string
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

