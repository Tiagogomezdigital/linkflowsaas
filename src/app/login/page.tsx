'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Falha no login')
      }

      router.push('/dashboard/grupos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  // Para demonstração, simular login direto
  const handleDemoLogin = () => {
    router.push('/dashboard/grupos')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-lime-500/10 border border-lime-500/20 mb-4">
            <Zap className="w-8 h-8 text-lime-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">LinkFlow</h1>
          <p className="text-text-secondary">WhatsApp Manager</p>
        </div>

        {/* Form Card */}
        <div className="bg-surface rounded-2xl border border-surface-border p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Bem-vindo de volta</h2>
            <p className="text-sm text-text-secondary mt-1">
              Entre com suas credenciais para acessar o painel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-text-muted hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-surface-border bg-surface"
                />
                <span className="text-sm text-text-secondary">Lembrar de mim</span>
              </label>
              <a href="#" className="text-sm text-lime-400 hover:text-lime-300 transition-colors">
                Esqueceu a senha?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Entrar
            </Button>
          </form>

          {/* Divisor */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-surface-border" />
            <span className="text-xs text-text-muted">OU</span>
            <div className="flex-1 h-px bg-surface-border" />
          </div>

          {/* Botão Demo */}
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleDemoLogin}
          >
            Acessar Demonstração
          </Button>

          {/* Footer */}
          <p className="text-center text-sm text-text-secondary mt-6">
            Não tem uma conta?{' '}
            <a href="/checkout" className="text-lime-400 hover:text-lime-300 transition-colors">
              Criar conta
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-6">
          © 2025 LinkFlow. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}

