# LinkFlow SaaS - WhatsApp Manager

Sistema de distribuição inteligente de leads para WhatsApp com rotação de números, mensagens personalizadas e analytics.

![LinkFlow](https://img.shields.io/badge/LinkFlow-WhatsApp%20Manager-84cc16)

## 🚀 Funcionalidades

- **Gestão de Grupos**: CRUD completo de grupos com slug único, descrição e mensagem padrão
- **Gestão de Números**: Cadastro de números WhatsApp com mensagem customizada por número
- **Links Públicos**: URLs curtas `/l/{slug}` com rotação automática de números ativos
- **Analytics**: Relatórios detalhados com filtros por período, grupo e dispositivo
- **Multi-tenant**: Isolamento de dados por empresa com RLS
- **Planos**: Limites por plano (trial, starter, professional, enterprise)

## 🛠️ Tecnologias

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Estilização**: Tailwind CSS
- **Backend**: API Routes do Next.js
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: JWT + Cookie (`auth-token`)
- **Deploy**: Vercel

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/linkflow-saas.git
cd linkflow-saas
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# JWT Secret (mínimo 32 caracteres)
JWT_SECRET=sua-chave-secreta-muito-longa-aqui

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configure o banco de dados

Execute o SQL de migração no Supabase (veja `supabase/migrations/001_initial.sql`).

### 5. Execute o projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/               # Login, Logout
│   │   ├── groups/             # CRUD de grupos
│   │   ├── numbers/            # CRUD de números
│   │   ├── redirect/           # Redirecionamento público
│   │   ├── stats/              # Estatísticas filtradas
│   │   └── group-stats/        # Stats por grupo
│   ├── dashboard/              # Páginas do dashboard
│   │   ├── grupos/
│   │   ├── numeros/
│   │   └── relatorios/
│   ├── l/[slug]/               # Página de redirecionamento
│   └── login/                  # Página de login
├── components/
│   ├── layout/                 # Sidebar, Header
│   ├── ui/                     # Componentes reutilizáveis
│   └── groups/                 # Componentes específicos de grupos
├── lib/
│   ├── auth.ts                 # Autenticação JWT
│   ├── supabase/               # Clientes Supabase
│   └── utils.ts                # Utilitários
└── types/
    └── index.ts                # Tipos TypeScript
```

## 🔄 Fluxo de Redirecionamento

1. Visitante acessa `/l/{slug}`
2. Sistema busca grupo pelo slug
3. Seleciona próximo número ativo (round-robin por `last_used_at`)
4. Registra clique com device, IP, user-agent
5. Redireciona para `wa.me/{phone}?text={mensagem}`

## 📊 APIs Principais

### Grupos
- `GET /api/groups` - Lista grupos da empresa
- `POST /api/groups` - Cria novo grupo
- `PUT /api/groups/[id]` - Atualiza grupo
- `DELETE /api/groups/[id]` - Remove grupo

### Números
- `GET /api/numbers?groupId=` - Lista números
- `POST /api/numbers` - Adiciona número
- `PUT /api/numbers/[id]` - Atualiza número
- `DELETE /api/numbers/[id]` - Remove número
- `GET /api/numbers/next?groupSlug=` - Próximo número (rotação)

### Analytics
- `GET /api/group-stats` - Estatísticas por grupo
- `POST /api/stats/filtered` - Stats com filtros

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

## 🎨 Design System

O projeto usa um tema dark consistente:

- **Background**: `#0a0a0a`
- **Surface**: `#141414`
- **Destaque**: `#84cc16` (lime-500)
- **Texto**: `#ffffff` / `#a1a1aa` / `#71717a`
- **Bordas**: `#2a2a2a`

## 🔒 Segurança

- Autenticação via JWT com cookie HttpOnly
- RLS (Row Level Security) no Supabase
- Filtros explícitos por `company_id` em todas as queries
- Service role key apenas no backend

## 🔐 Painel Admin

O sistema inclui um painel administrativo completo para gestão do SaaS:

### Acessar: `/admin`

**Funcionalidades:**
- **Dashboard**: Visão geral com métricas de empresas, usuários, cliques e MRR
- **Empresas**: Lista e gerenciamento de todos os clientes
- **Usuários**: Controle de todos os usuários do sistema
- **Métricas**: Analytics globais, funil de conversão, churn rate
- **Planos**: Configuração e comparativo de planos

### APIs Admin
- `GET /api/admin/stats` - Estatísticas globais do sistema
- `GET /api/admin/companies` - Lista todas as empresas
- `POST /api/admin/companies` - Criar nova empresa
- `GET /api/admin/users` - Lista todos os usuários
- `POST /api/admin/users` - Criar novo usuário

## 📈 Roadmap

- [ ] Integração com billing (AbacatePay)
- [ ] Domínios customizados (enterprise)
- [ ] Webhooks para eventos
- [ ] Exportação de relatórios em PDF
- [ ] Dashboard de overview
- [ ] Autenticação 2FA para admin

## 📝 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

Desenvolvido com 💚 por LinkFlow Team

