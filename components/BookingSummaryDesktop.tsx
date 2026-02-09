'use client'

interface Servico {
  id: string
  nome: string
  preco: number
  duracao: number
}

interface Pacote {
  id: string
  nome: string
  valor: number
  duracao_total: number
}

interface Profissional {
  id: string
  nome_completo: string
}

interface BookingSummaryDesktopProps {
  servicos: (Servico | Pacote)[]
  profissional: Profissional | null
  data: string | null
  horario: string | null
  currentStep: number
}

export default function BookingSummaryDesktop({
  servicos,
  profissional,
  data,
  horario,
  currentStep,
}: BookingSummaryDesktopProps) {
  const totalPreco = servicos.reduce((sum, s) => {
    return sum + ('preco' in s ? s.preco : s.valor)
  }, 0)
  const totalDuracao = servicos.reduce((sum, s) => {
    return sum + ('duracao' in s ? s.duracao : s.duracao_total)
  }, 0)

  // Só mostra a partir da etapa 2 (quando tem pelo menos serviço selecionado)
  if (currentStep < 2 || servicos.length === 0) {
    return null
  }

  return (
    <div className="hidden md:block sticky top-6 bg-white rounded-xl shadow-lg p-6 space-y-4 border border-gray-100">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h3 className="text-lg font-bold text-gray-900">Resumo do Agendamento</h3>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
      </div>

      <div className="space-y-4">
        {/* Data e Horário */}
        {data && (
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Data</p>
                <p className="font-semibold text-gray-900">
                  {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  }).replace(/^\w/, c => c.toUpperCase())}
                </p>
              </div>
            </div>

            {horario && totalDuracao > 0 && (
              <div className="flex items-start gap-3 ml-8">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Horário</p>
                  <p className="font-semibold text-gray-900">
                    {horario} - {(() => {
                      const [h, m] = horario.split(':').map(Number);
                      const totalMinutos = h * 60 + m + totalDuracao;
                      const horaFim = Math.floor(totalMinutos / 60);
                      const minutoFim = totalMinutos % 60;
                      return `${String(horaFim).padStart(2, '0')}:${String(minutoFim).padStart(2, '0')}`;
                    })()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Serviços */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Serviços</p>
            </div>
          </div>
          <div className="ml-8 space-y-2">
            {servicos.map((item) => {
              const preco = 'preco' in item ? item.preco : item.valor
              const duracao = 'duracao' in item ? item.duracao : item.duracao_total
              return (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{item.nome}</p>
                    <p className="text-xs text-gray-500">
                      {Math.floor(duracao / 60)}h {duracao % 60}min
                    </p>
                  </div>
                  <p className="text-secondary font-semibold">
                    R$ {preco.toFixed(2)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Profissional */}
        {profissional && (
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[#0a7ea4] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Profissional</p>
              <p className="font-semibold text-gray-900">{profissional.nome_completo}</p>
            </div>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xs text-gray-400">
              {Math.floor(totalDuracao / 60)}h {totalDuracao % 60}min
            </p>
          </div>
          <p className="text-2xl font-bold text-secondary">
            R$ {totalPreco.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Badge de progresso */}
      <div className="bg-purple-50 rounded-lg px-4 py-3 border border-purple-100">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-purple-900">
              Etapa {currentStep} de 5
            </p>
            <p className="text-xs text-purple-700">
              {currentStep === 5 ? 'Pronto para confirmar!' : 'Continue preenchendo'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
