'use client'

import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function ErrorPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-lg border border-border p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Algo deu errado
        </h1>
        
        <p className="text-text-secondary mb-6">
          Ocorreu um erro inesperado.
        </p>
        
        <p className="text-sm text-text-tertiary mb-8">
          Tente novamente ou entre em contato conosco.
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
            onClick={() => router.refresh()}
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </Button>
        </div>
        
        <p className="text-xs text-text-tertiary mt-8">
          Powered by LinkFlow
        </p>
      </div>
    </div>
  )
}

