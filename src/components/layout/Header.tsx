'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface HeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
}

export default function Header({ 
  title, 
  description, 
  breadcrumbs = [], 
  actions 
}: HeaderProps) {
  return (
    <header className="flex flex-col gap-4 mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-text-muted hover:text-white transition-colors">
            Dashboard
          </Link>
          {breadcrumbs.map((item, index) => (
            <span key={index} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-text-muted" />
              {item.href ? (
                <Link href={item.href} className="text-text-muted hover:text-white transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-text-secondary">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title e Actions */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {description && (
            <p className="mt-1 text-text-secondary">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}

