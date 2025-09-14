'use client';

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Home, History, TrendingUp, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = React.useState(false)

  const isActive = (href: string) => {
    if (href === '/envio') return pathname?.startsWith('/envio')
    return pathname === href
  }

  const Button = ({
    href,
    icon,
    label,
    title,
  }: {
    href: string
    icon: React.ReactNode
    label: string
    title: string
  }) => (
    <button
      type="button"
      onClick={() => handleNavigate(href)}
      className={`w-full flex items-center gap-2 py-3 px-4 rounded-xl transition-all font-medium backdrop-blur-sm text-sm ${
        isActive(href) ? 'sidebar-button-active' : 'sidebar-button-inactive'
      } ${collapsed ? 'justify-center' : ''}`}
      title={collapsed ? title : ''}
      aria-current={isActive(href) ? 'page' : undefined}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </button>
  )

  const { user } = useAuth()
  const [showVisitorNotice, setShowVisitorNotice] = React.useState(false)
  const [requestedHref, setRequestedHref] = React.useState<string | null>(null)

  const restricted = (href: string) => ['/historico', '/evolucao', '/favoritas'].includes(href)

  function handleNavigate(href: string) {
    if (!user && restricted(href)) {
      setRequestedHref(href)
      setShowVisitorNotice(true)
      return
    }
    router.push(href)
  }

  return (
    <>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed left-3 top-6 z-50 p-2 rounded-lg backdrop-blur-sm transition-colors sidebar-toggle-button"
        aria-label={collapsed ? 'Expandir sidebar' : 'Contrair sidebar'}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <aside className={`border-r backdrop-blur-sm border-gray-700/50 bg-gray-800/10 transition-all duration-300 ${
        collapsed ? 'p-2 w-16' : 'p-6 w-72'
      }`}>
        <div className={`flex flex-col gap-4 mt-16 ${collapsed ? 'items-center' : 'items-center'}`}>
          <div className="space-y-3 w-full">
            <Button
              href="/envio"
              icon={<Home size={18} />}
              label="Início"
              title="Início"
            />
            <Button
              href="/historico"
              icon={<History size={18} />}
              label="Histórico"
              title="Histórico"
            />
            <Button
              href="/evolucao"
              icon={<TrendingUp size={18} />}
              label="Evolução"
              title="Evolução"
            />
            <Button
              href="/favoritas"
              icon={<Star size={18} />}
              label="Favoritas"
              title="Favoritas"
            />
          </div>
        </div>
      </aside>

      {showVisitorNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/60">
          <div className="max-w-md w-full mx-4 p-6 rounded-2xl border border-purple-400/50 bg-gradient-to-br from-purple-800/95 via-purple-900/95 to-black/80 text-white shadow-[0_10px_40px_rgba(168,85,247,0.3)] backdrop-blur-md">
            <h2 className="text-xl font-semibold text-purple-200 mb-2">Recurso exclusivo para usuários logados</h2>
            <p className="text-purple-100/90 mb-4">
              As seções Histórico, Evolução e Favoritas ficam disponíveis após login. Crie uma conta ou faça login para acessar.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowVisitorNotice(false)}
                className="px-4 py-2 rounded-lg border border-purple-400/60 text-purple-100 hover:bg-purple-900/40"
              >
                Fechar
              </button>
              <button
                onClick={() => { setShowVisitorNotice(false); router.push('/') }}
                className="px-4 py-2 rounded-lg btn-primary"
              >
                Ir para Início
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


