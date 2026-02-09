'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SkeletonHorarios } from './SkeletonLoader';
import { SpinnerOverlay } from './Spinner';

interface Props {
  data: string;
  horario: string;
  onChange: (horario: string) => void;
  onNext: () => void;
  onBack: () => void;
  estabelecimentoId: string;
  profissionalId: string;
  duracaoTotal: number;
  horarioAbertura?: string;
  horarioFechamento?: string;
  intervaloAgendamento?: number;
  antecedenciaMinima?: number; // Em horas
}

export default function SelecionarHorario({
  data,
  horario,
  onChange,
  onNext,
  onBack,
  estabelecimentoId,
  profissionalId,
  duracaoTotal,
  horarioAbertura = '08:00',
  horarioFechamento = '18:00',
  intervaloAgendamento = 30,
  antecedenciaMinima = 2,
}: Props) {
  const [horarios, setHorarios] = useState<string[]>([]);
  const [horariosOcupados, setHorariosOcupados] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data && profissionalId) {
      carregarHorarios();
    }
  }, [data, profissionalId, duracaoTotal, horarioAbertura, horarioFechamento, intervaloAgendamento]);

  async function carregarHorarios() {
    setLoading(true);
    
    // Buscar agendamentos já existentes
    const { data: agendamentos } = await supabase
      .from('agendamentos')
      .select('data_hora, horario_termino')
      .eq('estabelecimento_id', estabelecimentoId)
      .eq('usuario_id', profissionalId)
      .gte('data_hora', `${data}T00:00:00`)
      .lt('data_hora', `${data}T23:59:59`)
      .in('status', ['agendado', 'confirmado', 'em_atendimento']);

    const ocupados = new Set<string>();

    if (agendamentos && agendamentos.length > 0) {
      // Para cada agendamento, marcar todos os horários entre início e fim como ocupados
      agendamentos.forEach((agendamento: any) => {
        const inicio = new Date(agendamento.data_hora);
        const [horaFim, minFim] = agendamento.horario_termino.split(':').map(Number);
        const fim = new Date(data);
        fim.setHours(horaFim, minFim, 0);

        // Marcar todos os horários do agendamento como ocupados
        const horaInicio = inicio.getHours();
        const minInicio = inicio.getMinutes();
        const minutosTotaisInicio = horaInicio * 60 + minInicio;
        const minutosTotaisFim = horaFim * 60 + minFim;

        for (let m = minutosTotaisInicio; m < minutosTotaisFim; m += intervaloAgendamento) {
          const h = Math.floor(m / 60);
          const min = m % 60;
          ocupados.add(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
        }
      });
    }

    setHorariosOcupados(ocupados);
    gerarHorarios(agendamentos || []);
  }

  function gerarHorarios(agendamentosExistentes: any[]) {
    // Usar horários configurados pelo estabelecimento
    const horariosLista: string[] = [];
    
    // Converter strings de horário para minutos
    const [horaInicio, minutoInicio] = horarioAbertura.split(':').map(Number);
    const [horaFim, minutoFim] = horarioFechamento.split(':').map(Number);
    const totalMinutosInicio = horaInicio * 60 + minutoInicio;
    const totalMinutosFim = horaFim * 60 + minutoFim;
    
    // Obter data e hora atual
    const agora = new Date();
    const dataSelecionada = new Date(data + 'T00:00:00');
    const isHoje = dataSelecionada.toDateString() === agora.toDateString();
    const horaAtual = agora.getHours() * 60 + agora.getMinutes();
    
    // Calcular o horário mínimo permitido (hora atual + antecedência em minutos)
    const antecedenciaMinutos = antecedenciaMinima * 60;
    const horarioMinimoPermitido = horaAtual + antecedenciaMinutos;
    
    // Gerar horários com o intervalo configurado
    for (let minutos = totalMinutosInicio; minutos < totalMinutosFim; minutos += intervaloAgendamento) {
      // Se for hoje, só adiciona horários futuros (considerando antecedência mínima)
      if (isHoje && minutos < horarioMinimoPermitido) {
        continue;
      }
      
      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;
      const horarioStr = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      
      // Verificar se este horário causaria sobreposição
      if (!verificarSobreposicao(minutos, agendamentosExistentes)) {
        horariosLista.push(horarioStr);
      }
    }

    setHorarios(horariosLista);
    setLoading(false);
  }

  // Verifica se um horário de início causaria sobreposição com agendamentos existentes
  function verificarSobreposicao(minutosInicio: number, agendamentosExistentes: any[]): boolean {
    const minutosFim = minutosInicio + duracaoTotal;

    for (const agendamento of agendamentosExistentes) {
      const inicio = new Date(agendamento.data_hora);
      const [horaFim, minFim] = agendamento.horario_termino.split(':').map(Number);
      
      const agendamentoInicio = inicio.getHours() * 60 + inicio.getMinutes();
      const agendamentoFim = horaFim * 60 + minFim;

      // Verifica sobreposição: novo começa antes do existente terminar E novo termina depois do existente começar
      if (minutosInicio < agendamentoFim && minutosFim > agendamentoInicio) {
        return true; // Há sobreposição
      }
    }

    return false; // Sem sobreposição
  }

  if (loading) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Escolha o Horário</h2>
          <p className="text-base sm:text-lg text-gray-600 mt-2">
            {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <SpinnerOverlay message="Buscando horários disponíveis..." />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Escolha o Horário</h2>
        <p className="text-base sm:text-lg text-gray-600 mt-2">Selecione o melhor horário</p>
      </div>

      {/* Grid no desktop, Lista no mobile */}
      <div className="flex flex-col md:grid md:grid-cols-4 lg:grid-cols-5 gap-2">
        {horarios.map((h) => (
          <button
            key={h}
            onClick={() => onChange(h)}
            className={`py-4 px-4 rounded-xl text-base font-semibold transition-all duration-200 ${
              horario === h
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-gray-200 hover:border-blue-300 text-gray-900 hover:bg-blue-50'
            } md:py-3`}
          >
            <div className="flex items-center justify-between md:justify-center gap-2">
              <span className="md:hidden">🕐</span>
              <span>{h}</span>
              {horario === h && (
                <svg className="w-5 h-5 md:hidden" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      {horarios.length === 0 && (
        <div className="text-center py-12 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-lg text-orange-900 font-medium">
            ⚠️ Não há horários disponíveis para hoje
          </p>
          <p className="text-sm text-orange-700 mt-2">
            Por favor, selecione outra data
          </p>
        </div>
      )}

      {horario && (
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-base sm:text-lg text-blue-900 font-medium">
            Horário: {horario}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 px-6 rounded-lg text-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!horario}
          className="flex-1 py-4 px-6 rounded-lg text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
