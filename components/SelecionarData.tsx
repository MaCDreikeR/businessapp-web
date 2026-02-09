'use client';

import { useState, useEffect } from 'react';

interface Props {
  data: string;
  onChange: (data: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SelecionarData({
  data,
  onChange,
  onNext,
  onBack,
}: Props) {
  const [mes, setMes] = useState(new Date());
  const [diasDisponiveis, setDiasDisponiveis] = useState<string[]>([]);

  useEffect(() => {
    calcularDiasDisponiveis();
  }, [mes]);

  function calcularDiasDisponiveis() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Máximo: 60 dias no futuro
    const maxDate = new Date(hoje);
    maxDate.setDate(maxDate.getDate() + 60);

    const dias: string[] = [];
    const primeiroDia = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const ultimoDia = new Date(mes.getFullYear(), mes.getMonth() + 1, 0);

    for (let d = primeiroDia; d <= ultimoDia; d.setDate(d.getDate() + 1)) {
      const dataAtual = new Date(d);
      // Permite agendamento a partir de hoje até 60 dias
      if (dataAtual >= hoje && dataAtual <= maxDate) {
        dias.push(dataAtual.toISOString().split('T')[0]);
      }
    }

    setDiasDisponiveis(dias);
  }

  function proximoMes() {
    setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1));
  }

  function mesAnterior() {
    const mesAnteriorDate = new Date(mes.getFullYear(), mes.getMonth() - 1, 1);
    const hoje = new Date();
    if (mesAnteriorDate >= new Date(hoje.getFullYear(), hoje.getMonth(), 1)) {
      setMes(mesAnteriorDate);
    }
  }

  function renderCalendario() {
    const primeiroDia = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const ultimoDia = new Date(mes.getFullYear(), mes.getMonth() + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const inicioDaSemana = primeiroDia.getDay();

    const dias = [];
    
    // Dias vazios antes do primeiro dia
    for (let i = 0; i < inicioDaSemana; i++) {
      dias.push(<div key={`empty-${i}`} />);
    }

    // Dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const dataStr = `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const disponivel = diasDisponiveis.includes(dataStr);
      const selecionado = data === dataStr;

      dias.push(
        <button
          key={dataStr}
          disabled={!disponivel}
          onClick={() => disponivel && onChange(dataStr)}
          className={`aspect-square p-2 sm:p-3 rounded-lg text-base sm:text-lg font-semibold transition-all ${
            selecionado
              ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2 shadow-lg'
              : disponivel
              ? 'bg-white hover:bg-blue-50 text-gray-900 border-2 border-gray-300 hover:border-blue-400 hover:shadow-md'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
          }`}
        >
          {dia}
        </button>
      );
    }

    return dias;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Escolha a Data</h2>
        <p className="text-base sm:text-lg text-gray-600 mt-2">Selecione o dia desejado</p>
      </div>

      {/* Navegação do mês */}
      <div className="flex items-center justify-between py-3">
        <button
          onClick={mesAnterior}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg sm:text-xl font-bold capitalize text-gray-900">
          {mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={proximoMes}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendário */}
      <div>
        <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-3 text-center text-sm sm:text-base font-semibold text-gray-700">
          <div>D</div>
          <div>S</div>
          <div>T</div>
          <div>Q</div>
          <div>Q</div>
          <div>S</div>
          <div>S</div>
        </div>
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {renderCalendario()}
        </div>
      </div>

      {data && (
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-base sm:text-lg text-blue-900 font-medium">
            {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="w-full py-4 px-6 rounded-lg text-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!data}
          className="w-full py-4 px-6 rounded-lg text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
