#!/bin/bash

# Script para fazer deploy na Vercel
# Uso: ./deploy-vercel.sh

set -e

echo "🚀 Preparando deploy na Vercel..."
echo ""

# Verificar se está logado
if ! npx vercel@latest whoami &>/dev/null; then
    echo "⚠️  Você precisa fazer login na Vercel primeiro."
    echo ""
    echo "Execute:"
    echo "  npx vercel@latest login"
    echo ""
    echo "Depois execute este script novamente."
    exit 1
fi

echo "✅ Logado na Vercel"
echo ""

# Fazer deploy
echo "📦 Iniciando deploy..."
npx vercel@latest --yes --prod

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente no dashboard da Vercel"
echo "2. Acesse: https://vercel.com/dashboard"
echo "3. Vá em Settings → Environment Variables"
echo "4. Adicione as variáveis necessárias (veja DEPLOY_VERCEL.md)"


