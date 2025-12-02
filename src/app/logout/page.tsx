'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, LogOut } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function LogoutPage() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(true)

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
        })

        if (response.ok) {
          // Aguardar um pouco antes de redirecionar
          setTimeout(() => {
            router.push('/login')
          }, 1000)
        } else {
          // Mesmo se der erro, redirecionar para login
          setTimeout(() => {
            router.push('/login')
          }, 1000)
        }
      } catch (error) {
        console.error('Error during logout:', error)
        // Mesmo se der erro, redirecionar para login
        setTimeout(() => {
          router.push('/login')
        }, 1000)
      } finally {
        setIsLoggingOut(false)
      }
    }

    handleLogout()
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-lime-500" />
          </div>
          <span className="text-2xl font-bold text-white">LinkFlow</span>
        </div>

        <div className="bg-surface border border-surface-border rounded-xl p-8 max-w-md">
          {isLoggingOut ? (
            <>
              <div className="flex items-center justify-center mb-4">
                <LogOut className="w-12 h-12 text-lime-500 animate-pulse" />
              </div>
              <h1 className="text-xl font-semibold text-white mb-2">
                Saindo...
              </h1>
              <p className="text-text-secondary">
                Aguarde enquanto fazemos logout do sistema
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-lime-500/20 flex items-center justify-center">
                  <LogOut className="w-6 h-6 text-lime-500" />
                </div>
              </div>
              <h1 className="text-xl font-semibold text-white mb-2">
                Logout realizado
              </h1>
              <p className="text-text-secondary mb-6">
                Você foi desconectado com sucesso
              </p>
              <Button
                onClick={() => router.push('/login')}
                variant="primary"
                className="w-full"
              >
                Voltar para Login
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

