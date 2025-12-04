## Diagnóstico Geral – LinkFlow SaaS

### 1. Lacunas críticas (alta prioridade)
- **Cobrança incompleta**: checkout não integra com gateway real, webhooks sem validação e sem fluxo de suspensão de contas ou atualização automática de `tenant_limits`.
- **Notificações inexistentes**: UI configura SMTP, mas não existe `lib/email.ts`, nem envio real de e-mails/WhatsApp ou cron jobs para lembretes de pagamento e limites.
- **Uso do Service Role no App Router**: `createPublicSchemaClient()` expõe `SUPABASE_SERVICE_ROLE_KEY` em todas as rotas, quebrando isolamento e deixando o banco vulnerável.
- **RBAC inexistente nas APIs admin**: rotas em `/api/admin/*` só verificam se o usuário está autenticado; qualquer conta logada consegue acessar dados globais.
- **Redirect sem observabilidade**: `/api/redirect/[slug]` não tem rate limit, não armazena falhas e depende de RPCs assíncronas sem retry; usuário recebe erro genérico.
- **Sem testes automatizados**: nenhum e2e ou unit test cobre signup, login, criação de grupos/números ou redirect; regressões só aparecem em produção.
- **Sem auditoria/logs**: não há histórico de alterações sensíveis (planos, exclusões, login). Dificulta troubleshooting e segurança.

### 2. Pontos médios
- **Onboarding parcial**: página de onboarding não salva progresso nem cria grupo inicial; LP → checkout → onboarding não aciona e-mails ou tours.
- **Experiência do dashboard**: dados dependem de refresh manual; deveria usar SWR/React Query ou WebSockets para cliques em tempo real e incluir filtros/paginação.
- **Relatórios limitados**: `/dashboard/relatorios` só exibe cliques. Falta export, comparação e filtros avançados.
- **Tenant limits inconsistentes**: modal “Adicionar Número” em `dashboard/grupos` não chama a API; limite por plano cai em fallback. Precisamos validar no backend e mostrar mensagens claras.
- **Relatórios admin parciais**: `/admin/metricas` e `/admin/planos` ainda misturam mocks e cálculos no client; deveria existir API consolidada por período com churn, LTV etc.

### 3. Pontos de atenção
- **Acessibilidade**: falta foco visível, ARIA em botões icônicos e contraste em alguns textos.
- **Internacionalização**: app mistura PT/EN e não há estratégia de i18n.
- **Documentação**: muitos arquivos auxiliares, mas faltam diagramas atualizados, processo de deploy e scripts de seed claros.

### 4. Recomendações imediatas
1. **Segurança / RBAC**
   - Criar middleware/guard que bloqueie `/api/admin/*` para usuários sem `is_admin`.
   - Substituir `createPublicSchemaClient()` por um cliente usando `NEXT_PUBLIC_SUPABASE_ANON_KEY` + policies específicas; reservar Service Role apenas para edge functions privadas.
2. **Pagamentos e notificações**
   - Implementar gateway real (Stripe, Asaas ou finalizar AbacatePay com assinatura verificada).
   - Criar cron job (Vercel Cron ou Supabase Scheduler) para revisar `subscription_status` e enviar e-mails/WhatsApp de cobrança ou bloqueio automático.
3. **Funcionalidades pendentes**
   - Finalizar modal “Adicionar Número” e demais fluxos que hoje só atualizam estado local.
   - Automatizar refresh (SWR/React Query) para cliques e estatísticas; opcionalmente usar canais realtime da Supabase.
   - Expandir relatórios com export CSV, comparação de períodos e ranking detalhado.
4. **Qualidade / Observabilidade**
   - Adicionar testes e2e (Playwright/Cypress) cobrindo LP → checkout → dashboard → redirect.
   - Instrumentar Sentry/Logflare e métricas customizadas para rotas sensíveis; armazenar logs de ações admin.

Com esses pontos resolvidos, o produto se aproxima de um estado “100%” operacional, reduzindo riscos de segurança, garantindo monetização real e elevando a confiabilidade do dashboard e das métricas.




