-- LinkFlow SaaS - Schema do Banco de Dados
-- Schema: redirect
-- Este arquivo reflete a estrutura atual do banco de dados Supabase

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- Empresas/Tenants
CREATE TABLE IF NOT EXISTS redirect.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  abacatepay_customer_id TEXT, -- ID do cliente no AbacatePay
  abacatepay_subscription_id TEXT, -- ID da assinatura no AbacatePay
  plan_type TEXT CHECK (plan_type IN ('monthly', 'annual')),
  subscription_status TEXT CHECK (subscription_status IN ('trial', 'active', 'canceled', 'past_due')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Usuários
CREATE TABLE IF NOT EXISTS redirect.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  company_id UUID NOT NULL REFERENCES redirect.companies(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' NOT NULL CHECK (role IN ('owner', 'member')),
  is_active BOOLEAN DEFAULT true NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Grupos de WhatsApp
CREATE TABLE IF NOT EXISTS redirect.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES redirect.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  default_message TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Números de WhatsApp
CREATE TABLE IF NOT EXISTS redirect.whatsapp_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES redirect.companies(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES redirect.groups(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  name TEXT,
  custom_message TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Cliques/Analytics
CREATE TABLE IF NOT EXISTS redirect.clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES redirect.companies(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES redirect.groups(id) ON DELETE CASCADE,
  number_id UUID REFERENCES redirect.whatsapp_numbers(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(20),
  referrer TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  browser VARCHAR(100),
  os VARCHAR(100),
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- TABELAS DE BILLING/SUBSCRIPTIONS
-- ============================================

-- Planos de Assinatura
CREATE TABLE IF NOT EXISTS redirect.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')),
  features JSONB DEFAULT '[]'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assinaturas
CREATE TABLE IF NOT EXISTS redirect.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID UNIQUE NOT NULL REFERENCES redirect.companies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES redirect.subscription_plans(id),
  abacatepay_billing_id VARCHAR(255),
  status VARCHAR(20) NOT NULL CHECK (status IN ('trial', 'active', 'cancelled', 'suspended', 'expired', 'past_due')),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  auto_renew BOOLEAN DEFAULT true,
  payment_method VARCHAR(50),
  next_billing_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Limites por Tenant
CREATE TABLE IF NOT EXISTS redirect.tenant_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID UNIQUE NOT NULL REFERENCES redirect.companies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES redirect.subscription_plans(id),
  max_groups INTEGER DEFAULT 3 NOT NULL,
  max_links_per_month INTEGER DEFAULT 100 NOT NULL,
  max_custom_domains INTEGER DEFAULT 0 NOT NULL,
  max_team_members INTEGER DEFAULT 1 NOT NULL,
  current_groups INTEGER DEFAULT 0 NOT NULL,
  current_links_this_month INTEGER DEFAULT 0 NOT NULL,
  current_custom_domains INTEGER DEFAULT 0 NOT NULL,
  current_team_members INTEGER DEFAULT 1 NOT NULL,
  month_start_date DATE DEFAULT CURRENT_DATE NOT NULL,
  last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS AUXILIARES
-- ============================================

-- Convites de Equipe
CREATE TABLE IF NOT EXISTS redirect.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES redirect.companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member' NOT NULL CHECK (role IN ('owner', 'member')),
  invited_by UUID NOT NULL REFERENCES redirect.users(id),
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Domínios Customizados (Enterprise)
CREATE TABLE IF NOT EXISTS redirect.custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES redirect.companies(id) ON DELETE CASCADE,
  domain VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_company_id ON redirect.users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON redirect.users(email);
CREATE INDEX IF NOT EXISTS idx_groups_company_id ON redirect.groups(company_id);
CREATE INDEX IF NOT EXISTS idx_groups_slug ON redirect.groups(slug);
CREATE INDEX IF NOT EXISTS idx_whatsapp_numbers_company_id ON redirect.whatsapp_numbers(company_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_numbers_group_id ON redirect.whatsapp_numbers(group_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_numbers_last_used ON redirect.whatsapp_numbers(last_used_at);
CREATE INDEX IF NOT EXISTS idx_clicks_company_id ON redirect.clicks(company_id);
CREATE INDEX IF NOT EXISTS idx_clicks_group_id ON redirect.clicks(group_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON redirect.clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_clicks_device_type ON redirect.clicks(device_type);
CREATE INDEX IF NOT EXISTS idx_custom_domains_company_id ON redirect.custom_domains(company_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON redirect.custom_domains(domain);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE redirect.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirect.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirect.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirect.whatsapp_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirect.clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirect.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirect.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirect.tenant_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirect.team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirect.custom_domains ENABLE ROW LEVEL SECURITY;

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE redirect.companies IS 'Empresas/Tenants do sistema multi-tenant';
COMMENT ON TABLE redirect.users IS 'Usuários do sistema com roles owner/member';
COMMENT ON TABLE redirect.groups IS 'Grupos de WhatsApp para distribuição de leads';
COMMENT ON TABLE redirect.whatsapp_numbers IS 'Números de WhatsApp associados aos grupos';
COMMENT ON TABLE redirect.clicks IS 'Registro de cliques/redirecionamentos para analytics';
COMMENT ON TABLE redirect.subscription_plans IS 'Planos de assinatura disponíveis';
COMMENT ON TABLE redirect.subscriptions IS 'Assinaturas ativas das empresas';
COMMENT ON TABLE redirect.tenant_limits IS 'Limites de uso por empresa/tenant';
COMMENT ON TABLE redirect.team_invites IS 'Convites pendentes para membros da equipe';
COMMENT ON TABLE redirect.custom_domains IS 'Domínios customizados (feature enterprise)';
