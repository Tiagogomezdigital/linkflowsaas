# LinkFlow SaaS — RPD (Requisitos de Produto Detalhado)

## 1. Visão & Proposta

- Proposta: Distribuição inteligente de leads para WhatsApp por meio de links públicos de grupos, com rotação de números, mensagem personalizada e analytics.
- Valor: Aumenta conversão e capacidade de atendimento, direcionando tráfego para o número correto e medindo desempenho por grupo e por número.
- Público-alvo: Times de vendas, suporte e marketing que operam WhatsApp com múltiplos atendentes.
- Diferenciais:
  - Links curtos por grupo (`/l/{slug}`) com rotação automática de números ativos.
  - Mensagem padrão no grupo + mensagem custom por número.
  - Relatórios detalhados com filtros por período, grupo e dispositivo.
  - Isolamento multi-tenant por empresa (RLS + filtros explícitos).
  - Limites por plano (trial, starter, enterprise).

## 2. Objetivos

- Simplificar a distribuição de tráfego de WhatsApp entre atendentes.
- Capturar e analisar cliques/redirecionamentos para decisões de operação.
- Garantir isolamento de dados por empresa e segurança.
- Oferecer base para monetização por planos.

## 3. Escopo Funcional

- Autenticação e sessão
  - Login com e-mail/senha, cookie `auth-token` JWT.
  - Fallback: sessão Supabase Auth para mapear `company_id` do usuário em `redirect.users`.
- Gestão de Grupos
  - CRUD: `name`, `slug` único, `description`, `default_message`, `is_active`.
  - Exibição de link público, cópia/abertura e métricas rápidas.
- Gestão de Números
  - CRUD: `phone`, `name` (descrição), `is_active`, `custom_message`.
  - Associação automática do `company_id` a partir do grupo.
- Redirecionamento
  - `GET /l/{slug}` e `GET /api/redirect/[slug]` resolvem próximo número ativo e registram clique.
  - `final_message` = `default_message` do grupo + `custom_message` do número.
- Analytics
  - Estatísticas por grupo via `GET /api/group-stats` e `POST /api/stats/filtered`.
  - Gráficos diários, ranking por grupo, distribuição por dispositivo.
- Planos & limites
  - Validação no `POST /api/groups` com `PLAN_LIMITS` + RPC de contagem.
- Enterprise (base)
  - Domínios customizados por empresa (enterprise), com políticas de acesso.
- Onboarding
  - Criação de empresa/usuário via RPC e emissão de cookie de sessão.

## 4. Arquitetura

- Frontend: Next.js (App Router), React.
- Backend: API Routes do Next.js.
- Banco: Supabase PostgreSQL, schema principal `redirect`.
- Auth: cookie `auth-token` (JWT) + Supabase Auth como fallback.
- Deploy: Vercel.
- Tenancy: filtro explícito por `company_id` e RLS aplicado.

## 5. Modelagem de Dados (simplificada)

- `redirect.companies`: `id`, `name`, `slug`, `subscription_status`, `plan_type`, timestamps.
- `redirect.users`: `id`, `email`, `name`, `company_id`, `role`, `is_active`, timestamps, `password_hash`.
- `redirect.groups`: `id`, `company_id`, `name`, `slug` (único), `description`, `default_message`, `is_active`, timestamps.
- `redirect.whatsapp_numbers`: `id`, `company_id`, `group_id`, `phone`, `name`, `custom_message`, `is_active`, `last_used_at`, timestamps.
- `redirect.clicks`: `id`, `company_id`, `group_id`, `number_id`, `ip_address`, `user_agent`, `device_type`, `referrer`, `created_at`.
- `redirect.custom_domains` (enterprise): `id`, `company_id`, `domain`, `status`, timestamps.

## 6. Principais APIs

- Grupos
  - `GET /api/groups`: lista grupos somente da empresa do usuário; fallback via sessão Supabase.
  - `POST /api/groups`: cria grupo (valida plano, slug e company).
  - `GET/PUT/DELETE /api/groups/[id]`: operações diretas.
  - `GET /api/groups/check-slug?slug=...`: valida disponibilidade de slug.
- Números
  - `GET /api/numbers?groupId=...`: lista números com join de grupo.
  - `POST /api/numbers`: cria número e associa `company_id` do grupo.
  - `PUT/PATCH/DELETE /api/numbers/[id]`: atualizações e remoções.
  - `GET /api/numbers/next?groupSlug=...`: resolve rotação.
- Redirecionamento
  - `GET /l/[slug]` e `GET /api/redirect/[slug]`: abre WhatsApp e registra clique.
- Analytics
  - `GET /api/group-stats`: stats por grupo via RPC.
  - `POST /api/stats/filtered`: agregações por dia e por grupo.
- Auth
  - `POST /api/auth/login`: emite cookie `auth-token`.
  - `POST /api/auth/signup`: cria empresa + usuário via RPC e emite cookie.
- Enterprise
  - `POST/GET/DELETE /api/enterprise/domains`: domínios customizados (enterprise).

## 7. Regras de Negócio

- Rotação: escolher próximo número ativo (preferencialmente por `last_used_at`/round-robin) e atualizar `last_used_at` após clique.
- Mensagens: concatenar mensagem padrão do grupo com a custom do número para `final_message` no redirecionamento.
- Limites de Plano: aplicar `PLAN_LIMITS` ao criar grupos; bloquear com `PLAN_LIMIT_REACHED` quando necessário.
- Tenancy: toda consulta/alteração é restrita por `company_id`.

## 8. UX & Telas

- Dashboard de Grupos: cards com métricas rápidas, link público, ações de editar/excluir, ver números e adicionar número.
- Números Globais: tabela com filtros, edição e exclusão.
- Relatórios: ranking de grupos, gráfico diário, distribuição por dispositivo, período selecionável.
- Configurações: billing, domínios (enterprise), webhook (planejado).

## 9. Segurança & Tenancy

- Autorização: `company_id` obtido via cookie `auth-token` e fallback de sessão Supabase.
- RLS: políticas por `company_id` nas tabelas críticas; reforço adicional no backend usando `.eq('company_id', ...)`.
- Chaves: uso de `service role` apenas no backend; nunca expor em cliente.

## 10. Métricas e KPIs

- Por Grupo: `total_numbers`, `active_numbers`, `total_clicks`, `clicks_today`, `clicks_this_week`, `clicks_this_month`, `last_click_at`.
- Por Número: `click_count`, `last_click`, `is_active`.
- Por Período: cliques por dia e por dispositivo.

## 11. Roadmap

- Segurança: RLS completo em `groups`, `whatsapp_numbers`, `clicks`; testes e2e de isolamento.
- Rotação: mover para RPC determinística com atualização de `last_used_at` transacional.
- Analytics: views/materialized views para performance em períodos longos.
- Billing: ciclo completo de cobrança e atualização de `plan_type` automático.
- UX: paginação e carregamento incremental na lista de grupos/números.
- Observabilidade: logs estruturados e monitoramento de saúde.

## 12. Critérios de Aceite

- Usuário de uma empresa não visualiza dados de outra.
- Criação de grupo/número reflete imediatamente no UI.
- Link público abre WhatsApp com `final_message` correta.
- Estatísticas por grupo conferem com registros de clique do período.

## 13. Riscos & Mitigações

- Cookie ausente em produção: fallback de sessão Supabase implementado; reforçar login e expiração.
- Divergências entre RPC e queries diretas: centralizar lógica crítica em RPCs estáveis; manter filtros explícitos.
- Isolamento de dados: adicionar testes e2e e validações em endpoints.

## 14. Integrações

- Supabase: banco, RPCs, Auth.
- AbacatePay: billing (em progresso).
- WhatsApp: deep link (`wa.me`) com mensagem.

