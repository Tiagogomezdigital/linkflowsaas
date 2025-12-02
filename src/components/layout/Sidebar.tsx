'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  Phone, 
  BarChart3, 
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  Activity,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  sublabel?: string
  icon: React.ComponentType<{ className?: string }>
}

const navigationItems: NavItem[] = [
  {
    href: '/dashboard/grupos',
    label: 'Grupos',
    sublabel: 'Gerenciar grupos de WhatsApp',
    icon: Users,
  },
  {
    href: '/dashboard/numeros',
    label: 'Números',
    sublabel: 'Gerenciar números globais',
    icon: Phone,
  },
]

const reportItems: NavItem[] = [
  {
    href: '/dashboard/relatorios',
    label: 'Relatórios de Links',
    sublabel: 'Análise de cliques e visitantes',
    icon: BarChart3,
  },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')
  const pathname = usePathname()

  useEffect(() => {
    // Verificar se é admin através da API /api/auth/me
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          const email = data.user?.email || ''
          const isAdminUser = data.user?.is_admin || false
          
          setUserEmail(email)
          setIsAdmin(isAdminUser)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
      }
    }

    checkAdmin()
  }, [])

  return (
    <aside 
      className={cn(
        'flex flex-col h-screen bg-background border-r border-surface-border transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-surface-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20">
          <Zap className="w-5 h-5 text-lime-500" />
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white">LinkFlow</h1>
            <p className="text-xs text-text-muted truncate">WhatsApp Manager</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          )}
        </button>
      </div>

      {/* Navegação Principal */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-6">
          {/* Seção Navegação */}
          <div>
            {!isCollapsed && (
              <p className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Navegação
              </p>
            )}
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      pathname === item.href 
                        ? 'bg-lime-500/10 border border-lime-500/20 text-lime-400' 
                        : 'hover:bg-surface-hover text-text-secondary hover:text-white'
                    )}
                  >
                    <item.icon className={cn(
                      'w-5 h-5 flex-shrink-0',
                      pathname === item.href ? 'text-lime-400' : ''
                    )} />
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{item.label}</p>
                        {item.sublabel && (
                          <p className="text-xs text-text-muted truncate">{item.sublabel}</p>
                        )}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Seção Relatórios */}
          <div>
            {!isCollapsed && (
              <p className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Relatórios
              </p>
            )}
            <ul className="space-y-1">
              {reportItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      pathname === item.href 
                        ? 'bg-lime-500/10 border border-lime-500/20 text-lime-400' 
                        : 'hover:bg-surface-hover text-text-secondary hover:text-white'
                    )}
                  >
                    <item.icon className={cn(
                      'w-5 h-5 flex-shrink-0',
                      pathname === item.href ? 'text-lime-400' : ''
                    )} />
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{item.label}</p>
                        {item.sublabel && (
                          <p className="text-xs text-text-muted truncate">{item.sublabel}</p>
                        )}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Seção Sistema */}
          <div>
            {!isCollapsed && (
              <p className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Sistema
              </p>
            )}
            <div className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface mb-2',
              isCollapsed ? 'justify-center' : ''
            )}>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-lime-400 animate-pulse" />
              </div>
              {!isCollapsed && (
                <span className="text-sm text-text-secondary">Online e funcionando</span>
              )}
            </div>
            
            {/* Link Admin - Apenas para admins */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:text-white hover:bg-purple-500/10 transition-all duration-200"
              >
                <Shield className="w-5 h-5 text-purple-400" />
                {!isCollapsed && (
                  <span className="font-medium text-purple-400">Painel Admin</span>
                )}
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* Footer - Usuário */}
      <div className="p-4 border-t border-surface-border">
        <div className={cn(
          'flex items-center gap-3',
          isCollapsed ? 'justify-center' : ''
        )}>
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-surface text-text-secondary font-semibold text-sm">
            A
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {userEmail.split('@')[0] || 'Usuário'}
                </p>
                <p className="text-xs text-text-muted truncate">{userEmail || 'Carregando...'}</p>
              </div>
              <Link
                href="/logout"
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4 text-text-muted" />
              </Link>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}

