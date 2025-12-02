# 🔐 Credenciais de Acesso Admin

## Usuário Administrador Criado

### Credenciais de Login

**Email:** `admin@linkflow.com`  
**Senha:** `admin123`

### Informações da Conta

- **Nome:** Administrador
- **Role:** Owner
- **Empresa:** Admin Company
- **Slug da Empresa:** admin
- **Status:** Ativo ✅

### Como Acessar

1. Acesse a URL da aplicação: `https://linkflowsaas.vercel.app/login` (ou sua URL de produção)
2. Faça login com as credenciais acima
3. Você será redirecionado para o dashboard: `/dashboard/grupos`
4. Para acessar o painel admin, vá para: `/admin`

### URLs Importantes

- **Login:** `/login`
- **Dashboard:** `/dashboard/grupos`
- **Painel Admin:** `/admin`
- **Admin - Estatísticas:** `/admin` (dashboard)
- **Admin - Empresas:** `/admin/empresas`
- **Admin - Usuários:** `/admin/usuarios`
- **Admin - Métricas:** `/admin/metricas`
- **Admin - Planos:** `/admin/planos`

### ⚠️ Segurança

**IMPORTANTE:** 
- Altere a senha padrão após o primeiro acesso
- Use uma senha forte em produção
- Mantenha essas credenciais seguras
- Não compartilhe essas informações publicamente

### Alterar Senha

Para alterar a senha, você pode:
1. Fazer login no sistema
2. Acessar as configurações do perfil (quando implementado)
3. Ou atualizar diretamente no banco de dados usando bcrypt

### Criar Hash de Nova Senha

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('SUA_NOVA_SENHA', 10).then(hash => console.log(hash));"
```

Depois atualize no banco:
```sql
UPDATE redirect.users 
SET password_hash = 'HASH_GERADO'
WHERE email = 'admin@linkflow.com';
```

