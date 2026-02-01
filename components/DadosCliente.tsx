'use client';

interface Props {
  nome: string;
  telefone: string;
  observacao: string;
  permiteObservacao: boolean;
  onChangeNome: (value: string) => void;
  onChangeTelefone: (value: string) => void;
  onChangeObservacao: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}

export default function DadosCliente({
  nome,
  telefone,
  observacao,
  permiteObservacao,
  onChangeNome,
  onChangeTelefone,
  onChangeObservacao,
  onSubmit,
  onBack,
  submitting,
}: Props) {
  function formatarTelefone(value: string) {
    const numeros = value.replace(/\D/g, '');
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return numeros.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }

  function handleTelefoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatarTelefone(e.target.value);
    onChangeTelefone(formatted);
  }

  const telefoneValido = telefone.replace(/\D/g, '').length >= 10;
  const nomeValido = nome.trim().length >= 3;
  const formularioValido = nomeValido && telefoneValido;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Seus Dados
        </h2>
        <p className="text-gray-600">
          Informe seus dados para finalizar o agendamento
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => onChangeNome(e.target.value)}
            placeholder="Seu nome completo"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
            Telefone (WhatsApp) *
          </label>
          <input
            type="tel"
            id="telefone"
            value={telefone}
            onChange={handleTelefoneChange}
            placeholder="(00) 00000-0000"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900"
            maxLength={15}
          />
          <p className="text-xs text-gray-500 mt-2">
            entraremos em contato por WhatsApp
          </p>
        </div>

        {permiteObservacao && (
          <div>
            <label htmlFor="observacao" className="block text-sm font-medium text-gray-700 mb-2">
              Observações (opcional)
            </label>
            <textarea
              id="observacao"
              value={observacao}
              onChange={(e) => onChangeObservacao(e.target.value)}
              placeholder="Alguma observação sobre seu agendamento?"
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-2">
              {observacao.length}/500 caracteres
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Importante:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Confirme todos os dados antes de confirmar o agendamento.</li>
              <li>Chegue com 15 minutos de antecedência</li>
              <li>Em caso de atraso, entre em contato</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={submitting}
          className="flex-1 py-4 px-6 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Voltar
        </button>
        <button
          onClick={onSubmit}
          disabled={!formularioValido || submitting}
          className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all ${
            formularioValido && !submitting
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processando...
            </span>
          ) : (
            'Confirmar Agendamento'
          )}
        </button>
      </div>
    </div>
  );
}
