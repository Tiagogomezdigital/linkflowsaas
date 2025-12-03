# 🧪 Teste de Funcionalidades - LinkFlow SaaS

## ✅ Checklist de Testes

### 1. 🔐 Autenticação

#### 1.1 Login
- [ ] **Página:** `/login`
- [ ] **Teste:** Acessar página de login
- [ ] **Teste:** Preencher email e senha válidos
- [ ] **Teste:** Submeter formulário
- [ ] **Esperado:** Redirecionamento para `/dashboard/grupos`
- [ ] **Teste:** Login com credenciais inválidas
- [ ] **Esperado:** Mensagem de erro "Credenciais inválidas"
- [ ] **Teste:** Login com usuário inativo
- [ ] **Esperado:** Mensagem "Conta inativa"

**API:** `POST /api/auth/login`
- [ ] **Teste:** Request com email e senha válidos
- [ ] **Esperado:** Status 200, retorna user object, cookie `auth-token` definido
- [ ] **Teste:** Request sem email ou senha
- [ ] **Esperado:** Status 400, erro de validação
- [ ] **Teste:** Request com credenciais inválidas
- [ ] **Esperado:** Status 401, erro "Invalid credentials"

#### 1.2 Signup
- [ ] **Página:** `/checkout`
- [ ] **Teste:** Preencher formulário completo
- [ ] **Teste:** Selecionar plano (Free/Mensal/Anual)
- [ ] **Teste:** Submeter formulário
- [ ] **Esperado:** Criação de conta + login automático + redirecionamento

**API:** `POST /api/auth/signup`
- [ ] **Teste:** Criar conta com dados válidos
- [ ] **Esperado:** Status 201, empresa + usuário criados, login automático
- [ ] **Teste:** Criar conta com slug duplicado
- [ ] **Esperado:** Status 409, erro "Slug já está em uso"
- [ ] **Teste:** Criar conta com email duplicado
- [ ] **Esperado:** Status 409, erro "Email já está cadastrado"
- [ ] **Teste:** Criar conta com senha < 6 caracteres
- [ ] **Esperado:** Status 400, erro de validação
- [ ] **Teste:** Criar conta com email inválido
- [ ] **Esperado:** Status 400, erro "Email inválido"

#### 1.3 Logout
- [ ] **Página:** `/logout`
- [ ] **Teste:** Acessar página de logout
- [ ] **Esperado:** Redirecionamento para `/login`, cookie removido

**API:** `POST /api/auth/logout`
- [ ] **Teste:** Fazer logout
- [ ] **Esperado:** Status 200, cookie `auth-token` removido

#### 1.4 Verificação de Autenticação
- [ ] **API:** `GET /api/auth/me`
- [ ] **Teste:** Request autenticado
- [ ] **Esperado:** Status 200, retorna dados do usuário
- [ ] **Teste:** Request sem autenticação
- [ ] **Esperado:** Status 401, erro "Unauthorized"

---

### 2. 📊 Dashboard

#### 2.1 Grupos
- [ ] **Página:** `/dashboard/grupos`
- [ ] **Teste:** Acessar página (requer autenticação)
- [ ] **Esperado:** Lista de grupos da empresa do usuário
- [ ] **Teste:** Criar novo grupo
- [ ] **Esperado:** Grupo criado e aparecendo na lista
- [ ] **Teste:** Editar grupo existente
- [ ] **Esperado:** Alterações salvas
- [ ] **Teste:** Excluir grupo
- [ ] **Esperado:** Grupo removido da lista
- [ ] **Teste:** Verificar isolamento (usuário A não vê grupos de usuário B)
- [ ] **Esperado:** Apenas grupos da própria empresa

**API:** `GET /api/groups`
- [ ] **Teste:** Request autenticado
- [ ] **Esperado:** Status 200, retorna grupos filtrados por `company_id`
- [ ] **Teste:** Request sem autenticação
- [ ] **Esperado:** Status 401

**API:** `POST /api/groups`
- [ ] **Teste:** Criar grupo com dados válidos
- [ ] **Esperado:** Status 201, grupo criado
- [ ] **Teste:** Criar grupo sem nome ou slug
- [ ] **Esperado:** Status 400, erro de validação
- [ ] **Teste:** Criar grupo com slug duplicado
- [ ] **Esperado:** Status 409, erro "Slug already exists"
- [ ] **Teste:** Criar grupo excedendo limite do plano
- [ ] **Esperado:** Status 403, erro "PLAN_LIMIT_REACHED"

**API:** `PUT /api/groups/[id]`
- [ ] **Teste:** Atualizar grupo existente
- [ ] **Esperado:** Status 200, grupo atualizado
- [ ] **Teste:** Atualizar grupo de outra empresa
- [ ] **Esperado:** Status 404, erro "Group not found"

**API:** `DELETE /api/groups/[id]`
- [ ] **Teste:** Excluir grupo existente
- [ ] **Esperado:** Status 200, grupo e números associados excluídos
- [ ] **Teste:** Excluir grupo de outra empresa
- [ ] **Esperado:** Status 404, erro "Group not found"

#### 2.2 Números
- [ ] **Página:** `/dashboard/numeros`
- [ ] **Teste:** Acessar página
- [ ] **Esperado:** Lista de números da empresa do usuário
- [ ] **Teste:** Adicionar número a um grupo
- [ ] **Esperado:** Número criado e aparecendo na lista
- [ ] **Teste:** Editar número existente
- [ ] **Esperado:** Alterações salvas
- [ ] **Teste:** Excluir número
- [ ] **Esperado:** Número removido
- [ ] **Teste:** Verificar isolamento
- [ ] **Esperado:** Apenas números da própria empresa

**API:** `GET /api/numbers`
- [ ] **Teste:** Request autenticado
- [ ] **Esperado:** Status 200, retorna números filtrados por `company_id`
- [ ] **Teste:** Filtrar por grupo (`?groupId=xxx`)
- [ ] **Esperado:** Apenas números do grupo especificado

**API:** `POST /api/numbers`
- [ ] **Teste:** Criar número com dados válidos
- [ ] **Esperado:** Status 201, número criado
- [ ] **Teste:** Criar número sem telefone ou grupo
- [ ] **Esperado:** Status 400, erro de validação
- [ ] **Teste:** Criar número em grupo de outra empresa
- [ ] **Esperado:** Status 404, erro "Group not found"

**API:** `PUT /api/numbers/[id]`
- [ ] **Teste:** Atualizar número existente
- [ ] **Esperado:** Status 200, número atualizado
- [ ] **Teste:** Atualizar número de outra empresa
- [ ] **Esperado:** Status 404, erro "Number not found"

**API:** `DELETE /api/numbers/[id]`
- [ ] **Teste:** Excluir número existente
- [ ] **Esperado:** Status 200, número excluído
- [ ] **Teste:** Excluir número de outra empresa
- [ ] **Esperado:** Status 404, erro "Number not found"

#### 2.3 Relatórios
- [ ] **Página:** `/dashboard/relatorios`
- [ ] **Teste:** Acessar página
- [ ] **Esperado:** Filtros e formulário de relatório
- [ ] **Teste:** Selecionar grupos
- [ ] **Esperado:** Apenas grupos da própria empresa aparecem
- [ ] **Teste:** Selecionar período
- [ ] **Teste:** Gerar relatório
- [ ] **Esperado:** Dados do relatório exibidos (cliques, ranking, dispositivos)
- [ ] **Teste:** Exportar CSV
- [ ] **Esperado:** Download de arquivo CSV

**API:** `POST /api/stats/filtered`
- [ ] **Teste:** Request com período e grupos válidos
- [ ] **Esperado:** Status 200, retorna estatísticas filtradas por `company_id`
- [ ] **Teste:** Request sem autenticação
- [ ] **Esperado:** Status 401

**API:** `GET /api/group-stats`
- [ ] **Teste:** Request autenticado
- [ ] **Esperado:** Status 200, retorna estatísticas dos grupos da empresa

---

### 3. 🔗 Redirecionamento de Links

#### 3.1 Link Público
- [ ] **Página:** `/l/[slug]`
- [ ] **Teste:** Acessar link válido de grupo ativo
- [ ] **Esperado:** Redirecionamento para WhatsApp com número selecionado
- [ ] **Teste:** Acessar link de grupo inativo
- [ ] **Esperado:** Redirecionamento para `/group-inactive`
- [ ] **Teste:** Acessar link de grupo sem números
- [ ] **Esperado:** Redirecionamento para `/no-numbers`
- [ ] **Teste:** Acessar link inexistente
- [ ] **Esperado:** Redirecionamento para `/not-found`
- [ ] **Teste:** Verificar round-robin (distribuição de cliques)
- [ ] **Esperado:** Números são rotacionados corretamente

**API:** `GET /api/redirect/[slug]`
- [ ] **Teste:** Request com slug válido
- [ ] **Esperado:** Status 302, redirecionamento para WhatsApp
- [ ] **Teste:** Verificar registro de clique na tabela `clicks`
- [ ] **Esperado:** Clique registrado com IP, user-agent, device_type
- [ ] **Teste:** Verificar atualização de `last_used_at` no número
- [ ] **Esperado:** Campo atualizado corretamente

---

### 4. 👨‍💼 Admin Panel

#### 4.1 Dashboard Admin
- [ ] **Página:** `/admin`
- [ ] **Teste:** Acessar como admin (`admin@linkflow.com`)
- [ ] **Esperado:** Dashboard com estatísticas gerais
- [ ] **Teste:** Acessar como usuário comum
- [ ] **Esperado:** Redirecionamento ou erro 403
- [ ] **Teste:** Verificar estatísticas exibidas
- [ ] **Esperado:** Total de empresas, usuários, cliques, MRR

**API:** `GET /api/admin/stats`
- [ ] **Teste:** Request autenticado como admin
- [ ] **Esperado:** Status 200, retorna estatísticas agregadas
- [ ] **Teste:** Request sem autenticação
- [ ] **Esperado:** Status 401

#### 4.2 Empresas
- [ ] **Página:** `/admin/empresas`
- [ ] **Teste:** Listar todas as empresas
- [ ] **Esperado:** Lista completa de empresas
- [ ] **Teste:** Filtrar por plano
- [ ] **Esperado:** Apenas empresas do plano selecionado
- [ ] **Teste:** Filtrar por status
- [ ] **Esperado:** Apenas empresas com status selecionado
- [ ] **Teste:** Buscar empresa por nome/slug
- [ ] **Esperado:** Resultados filtrados
- [ ] **Teste:** Ver detalhes da empresa
- [ ] **Esperado:** Modal com informações completas

**API:** `GET /api/admin/companies`
- [ ] **Teste:** Listar empresas
- [ ] **Esperado:** Status 200, retorna todas as empresas
- [ ] **Teste:** Filtrar por plano (`?plan=monthly`)
- [ ] **Esperado:** Apenas empresas do plano especificado
- [ ] **Teste:** Filtrar por status (`?status=active`)
- [ ] **Esperado:** Apenas empresas com status especificado
- [ ] **Teste:** Buscar (`?search=termo`)
- [ ] **Esperado:** Empresas que correspondem ao termo

**API:** `POST /api/admin/companies`
- [ ] **Teste:** Criar empresa com dados válidos
- [ ] **Esperado:** Status 201, empresa criada
- [ ] **Teste:** Criar empresa com slug duplicado
- [ ] **Esperado:** Status 409, erro "Slug already exists"

#### 4.3 Usuários
- [ ] **Página:** `/admin/usuarios`
- [ ] **Teste:** Listar todos os usuários
- [ ] **Esperado:** Lista completa de usuários
- [ ] **Teste:** Filtrar por role
- [ ] **Esperado:** Apenas usuários com role selecionado
- [ ] **Teste:** Filtrar por status
- [ ] **Esperado:** Apenas usuários ativos/inativos
- [ ] **Teste:** Buscar usuário por nome/email
- [ ] **Esperado:** Resultados filtrados
- [ ] **Teste:** Ver detalhes do usuário
- [ ] **Esperado:** Modal com informações completas

**API:** `GET /api/admin/users`
- [ ] **Teste:** Listar usuários
- [ ] **Esperado:** Status 200, retorna todos os usuários (sem password_hash)
- [ ] **Teste:** Filtrar por role (`?role=owner`)
- [ ] **Esperado:** Apenas usuários com role especificado
- [ ] **Teste:** Filtrar por status (`?status=active`)
- [ ] **Esperado:** Apenas usuários com status especificado
- [ ] **Teste:** Filtrar por empresa (`?company_id=xxx`)
- [ ] **Esperado:** Apenas usuários da empresa especificada

**API:** `POST /api/admin/users`
- [ ] **Teste:** Criar usuário com dados válidos
- [ ] **Esperado:** Status 201, usuário criado (sem password_hash no response)
- [ ] **Teste:** Criar usuário com email duplicado
- [ ] **Esperado:** Status 409, erro "Email already exists"
- [ ] **Teste:** Criar usuário em empresa inexistente
- [ ] **Esperado:** Status 404, erro "Company not found"

#### 4.4 Métricas
- [ ] **Página:** `/admin/metricas`
- [ ] **Teste:** Acessar página
- [ ] **Esperado:** Gráficos e métricas exibidos
- [ ] **Nota:** Esta página ainda usa dados mockados (requer API específica)

#### 4.5 Planos
- [ ] **Página:** `/admin/planos`
- [ ] **Teste:** Acessar página
- [ ] **Esperado:** Lista de planos disponíveis

#### 4.6 Configurações
- [ ] **Página:** `/admin/configuracoes`
- [ ] **Teste:** Acessar página
- [ ] **Esperado:** Formulário de configurações

---

### 5. 🏠 Páginas Públicas

#### 5.1 Landing Page
- [ ] **Página:** `/`
- [ ] **Teste:** Acessar sem autenticação
- [ ] **Esperado:** Página de apresentação do produto
- [ ] **Teste:** Acessar autenticado
- [ ] **Esperado:** Redirecionamento para `/dashboard/grupos`
- [ ] **Teste:** Verificar seção de planos
- [ ] **Esperado:** Planos Free, Mensal, Anual exibidos
- [ ] **Teste:** Clicar em "Começar Agora"
- [ ] **Esperado:** Redirecionamento para `/checkout`

#### 5.2 Checkout
- [ ] **Página:** `/checkout`
- [ ] **Teste:** Acessar página
- [ ] **Esperado:** Formulário de cadastro e seleção de plano
- [ ] **Teste:** Preencher formulário completo
- [ ] **Teste:** Selecionar plano
- [ ] **Teste:** Submeter formulário
- [ ] **Esperado:** Criação de conta + login automático

#### 5.3 Onboarding
- [ ] **Página:** `/onboarding`
- [ ] **Teste:** Acessar página
- [ ] **Esperado:** Tutorial/guia inicial

---

### 6. 🔒 Segurança e Isolamento

#### 6.1 Isolamento por Empresa
- [ ] **Teste:** Usuário A não vê grupos de usuário B
- [ ] **Teste:** Usuário A não vê números de usuário B
- [ ] **Teste:** Usuário A não vê estatísticas de usuário B
- [ ] **Teste:** API retorna apenas dados da empresa do usuário autenticado

#### 6.2 Proteção de Rotas
- [ ] **Teste:** Acessar `/dashboard/*` sem autenticação
- [ ] **Esperado:** Redirecionamento para `/login`
- [ ] **Teste:** Acessar `/admin/*` sem autenticação
- [ ] **Esperado:** Redirecionamento para `/login`
- [ ] **Teste:** Acessar `/admin/*` como usuário comum
- [ ] **Esperado:** Erro 403 ou redirecionamento

#### 6.3 Validação de Dados
- [ ] **Teste:** Tentar criar grupo com slug duplicado
- [ ] **Esperado:** Erro de validação
- [ ] **Teste:** Tentar criar número em grupo de outra empresa
- [ ] **Esperado:** Erro 404 "Group not found"
- [ ] **Teste:** Tentar atualizar grupo de outra empresa
- [ ] **Esperado:** Erro 404 "Group not found"

---

### 7. 📱 Funcionalidades Específicas

#### 7.1 Round-Robin de Números
- [ ] **Teste:** Criar grupo com múltiplos números
- [ ] **Teste:** Acessar link público múltiplas vezes
- [ ] **Esperado:** Números são rotacionados (menor `last_used_at` primeiro)

#### 7.2 Limites de Plano
- [ ] **Teste:** Criar grupos até atingir limite
- [ ] **Esperado:** Erro ao tentar criar grupo além do limite
- [ ] **Teste:** Verificar limites diferentes por plano
- [ ] **Esperado:** Planos têm limites corretos

#### 7.3 Estatísticas
- [ ] **Teste:** Gerar cliques em um grupo
- [ ] **Teste:** Verificar estatísticas do grupo
- [ ] **Esperado:** Contagem de cliques atualizada
- [ ] **Teste:** Verificar distribuição por dispositivo
- [ ] **Esperado:** Dados corretos de device_type

---

## 🐛 Problemas Conhecidos

1. **Página de Métricas Admin:** Ainda usa dados mockados (requer API específica)
2. **AbacatePay:** Não testado (conforme solicitado)

---

## 📝 Notas de Teste

### Credenciais de Teste

**Admin:**
- Email: `admin@linkflow.com`
- Senha: `admin123`

**Usuário Mensal:**
- Email: `mensal@linkflow.com`
- Senha: `mensal123`

**Usuário Anual:**
- Email: `anual@linkflow.com`
- Senha: `anual123`

---

## ✅ Resultado dos Testes

**Data:** _______________
**Testador:** _______________

**Status Geral:** ⬜ Passou ⬜ Falhou ⬜ Parcial

**Observações:**
_________________________________________________
_________________________________________________
_________________________________________________

