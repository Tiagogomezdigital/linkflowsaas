'use client'

import { useRouter } from 'next/navigation'
import { Search, ArrowLeft, Home } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NotFoundPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-lg border border-border p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <Search className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Link não encontrado
        </h1>
        
        <p className="text-text-secondary mb-6">
          O link que você está tentando acessar não existe ou foi removido.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <Button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Ir para Início
          </Button>
        </div>
        
        <p className="text-xs text-text-tertiary mt-8">
          Powered by LinkFlow
        </p>
      </div>
    </div>
  )
}

