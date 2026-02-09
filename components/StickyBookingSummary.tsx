'use client'

import { useState, useEffect } from 'react'

interface Servico {
  id: string
  nome: string
  preco: number
  duracao: number
}

interface Profissional {
  id: string
  nome: string
}

interface StickyBookingSummaryProps {
  servicos: Servico[]
  profissional: Profissional | null
  data: string | null
  horario: string | null
  currentStep: number
}

export default function StickyBookingSummary({
  servicos,
  profissional,
  data,
  horario,
  currentStep,
}: StickyBookingSummaryProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Colapsa ao rolar para baixo, expande ao rolar para cima
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsCollapsed(true)
      } else if (currentScrollY < lastScrollY) {
        setIsCollapsed(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const totalPreco = servicos.reduce((sum, s) => sum + s.preco, 0)
  const totalDuracao = servicos.reduce((sum, s) => sum + s.duracao, 0)

  // Só mostra a partir da etapa 3 (quando tem serviço e profissional)
  if (currentStep < 3 || servicos.length === 0) {
    return null
  }

  return (
    <div className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm transition-all duration-300">
      <div
        className={`px-4 transition-all duration-300 overflow-hidden ${
          isCollapsed ? 'py-2' : 'py-3'
        }`}
      >
        {/* Versão Colapsada */}
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-900">
                {servicos.length} {servicos.length === 1 ? 'serviço' : 'serviços'}
              </span>
              {profissional && profissional.nome && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{profissional.nome.split(' ')[0]}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-blue-600">
                R$ {totalPreco.toFixed(2)}
              </span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        ) : (
          /* Versão Expandida */
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Resumo do Agendamento</h3>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>

            <div className="space-y-1.5 text-sm">
              {/* Serviços */}
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 truncate">
                    {servicos.map(s => s.nome).join(', ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.floor(totalDuracao / 60)}h {totalDuracao % 60}min
                  </p>
                </div>
              </div>

              {/* Profissional */}
              {profissional && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-gray-600">{profissional.nome}</p>
                </div>
              )}

              {/* Data */}
              {data && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600">
                    {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                    })}
                    {horario && ` às ${horario}`}
                  </p>
                </div>
              )}
            </div>

            {/* Preço Total */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Total</span>
                <span className="text-lg font-bold text-blue-600">
                  R$ {totalPreco.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
