#!/bin/bash

# Script para criar repositório no GitHub e fazer push
# Uso: ./deploy-to-github.sh

set -e

REPO_NAME="linkflow-saas"
DESCRIPTION="Sistema completo de gestão de WhatsApp com rotação de números, analytics e painel admin"

echo "🚀 Preparando para criar repositório no GitHub..."

# Verificar se já existe remote
if git remote | grep -q origin; then
    echo "⚠️  Remote 'origin' já existe. Removendo..."
    git remote remove origin
fi

# Verificar se GitHub CLI está instalado
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI encontrado. Criando repositório..."
    
    # Criar repositório no GitHub
    gh repo create "$REPO_NAME" \
        --public \
        --description "$DESCRIPTION" \
        --source=. \
        --remote=origin \
        --push
    
    echo "✅ Repositório criado e código enviado com sucesso!"
    echo "🔗 Acesse: https://github.com/$(gh api user --jq .login)/$REPO_NAME"
else
    echo "⚠️  GitHub CLI não encontrado."
    echo ""
    echo "📝 Para criar o repositório manualmente:"
    echo ""
    echo "1. Acesse: https://github.com/new"
    echo "2. Nome do repositório: $REPO_NAME"
    echo "3. Descrição: $DESCRIPTION"
    echo "4. Escolha Public ou Private"
    echo "5. NÃO marque 'Initialize with README'"
    echo "6. Clique em 'Create repository'"
    echo ""
    echo "Depois execute:"
    echo "  git remote add origin https://github.com/SEU_USUARIO/$REPO_NAME.git"
    echo "  git branch -M main"
    echo "  git push -u origin main"
    echo ""
    echo "Ou se preferir SSH:"
    echo "  git remote add origin git@github.com:SEU_USUARIO/$REPO_NAME.git"
    echo "  git branch -M main"
    echo "  git push -u origin main"
fi


