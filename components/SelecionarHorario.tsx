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
  const [vagasPorHorario, setVagasPorHorario] = useState<Map<string, number>>(new Map());
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());

  useEffect(() => {
    if (data && profissionalId) {
      carregarHorarios();
      
      // Refresh automático a cada 30 segundos
      const interval = setInterval(() => {
        console.log('🔄 Atualizando horários disponíveis...');
        carregarHorarios();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [data, profissionalId, duracaoTotal, horarioAbertura, horarioFechamento, intervaloAgendamento]);

  async function carregarHorarios() {
    setLoading(true);
    setUltimaAtualizacao(new Date());
    
    // Buscar TODOS os profissionais que fazem atendimento
    const { data: todosProfissionais } = await supabase
      .from('usuarios')
      .select('id')
      .eq('estabelecimento_id', estabelecimentoId)
      .eq('faz_atendimento', 'true');
    
    const totalProfissionais = todosProfissionais?.length || 1;
    
    // Buscar agendamentos já existentes
    const { data: agendamentos } = await supabase
      .from('agendamentos')
      .select('data_hora, horario_termino, usuario_id')
      .eq('estabelecimento_id', estabelecimentoId)
      .gte('data_hora', `${data}T00:00:00`)
      .lt('data_hora', `${data}T23:59:59`)
      .in('status', ['agendado', 'confirmado', 'em_atendimento']);

    // Mapear vagas por horário
    const vagasMap = new Map<string, number>();
    const ocupadosPorProfissional = new Map<string, Set<string>>();

    if (agendamentos && agendamentos.length > 0) {
      agendamentos.forEach((agendamento: any) => {
        const inicio = new Date(agendamento.data_hora);
        const [horaFim, minFim] = agendamento.horario_termino.split(':').map(Number);
        
        const horaInicio = inicio.getHours();
        const minInicio = inicio.getMinutes();
        const minutosTotaisInicio = horaInicio * 60 + minInicio;
        const minutosTotaisFim = horaFim * 60 + minFim;

        // Inicializar set de ocupados para este profissional
        if (!ocupadosPorProfissional.has(agendamento.usuario_id)) {
          ocupadosPorProfissional.set(agendamento.usuario_id, new Set());
        }

        for (let m = minutosTotaisInicio; m < minutosTotaisFim; m += intervaloAgendamento) {
          const h = Math.floor(m / 60);
          const min = m % 60;
          const horarioStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
          ocupadosPorProfissional.get(agendamento.usuario_id)!.add(horarioStr);
        }
      });
    }

    setVagasPorHorario(vagasMap);
    gerarHorarios(agendamentos || [], ocupadosPorProfissional, totalProfissionais);
  }

  function gerarHorarios(agendamentosExistentes: any[], ocupadosPorProfissional: Map<string, Set<string>>, totalProfissionais: number) {
    const horariosLista: string[] = [];
    const vagasMap = new Map<string, number>();
    
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
    
    // Calcular o horário mínimo permitido
    const antecedenciaMinutos = antecedenciaMinima * 60;
    const horarioMinimoPermitido = horaAtual + antecedenciaMinutos;
    
    // Gerar horários com o intervalo configurado
    for (let minutos = totalMinutosInicio; minutos < totalMinutosFim; minutos += intervaloAgendamento) {
      if (isHoje && minutos < horarioMinimoPermitido) {
        continue;
      }
      
      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;
      const horarioStr = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      
      // Calcular quantos profissionais estão ocupados neste horário
      let profissionaisOcupados = 0;
      ocupadosPorProfissional.forEach((horariosOcupados) => {
        if (horariosOcupados.has(horarioStr)) {
          profissionaisOcupados++;
        }
      });
      
      const vagasRestantes = totalProfissionais - profissionaisOcupados;
      
      // Só adiciona o horário se houver vagas
      if (vagasRestantes > 0) {
        horariosLista.push(horarioStr);
        vagasMap.set(horarioStr, vagasRestantes);
      }
    }

    setHorarios(horariosLista);
    setVagasPorHorario(vagasMap);
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
        <div className="flex items-center justify-between">
          <p className="text-base sm:text-lg text-gray-600 mt-2">Selecione o melhor horário</p>
          <p className="text-xs text-gray-500 mt-2">
            Atualizado {ultimaAtualizacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Grid no desktop, Lista no mobile */}
      <div className="flex flex-col md:grid md:grid-cols-4 lg:grid-cols-5 gap-2">
        {horarios.map((h) => {
          const vagas = vagasPorHorario.get(h) || 0;
          const poucasVagas = vagas <= 2 && vagas > 0;
          
          return (
            <button
              key={h}
              onClick={() => onChange(h)}
              className={`relative py-4 px-4 rounded-xl text-base font-semibold transition-all duration-200 ${
                horario === h
                  ? 'bg-[#7C3AED] text-white shadow-md'
                  : 'bg-white border border-gray-200 hover:border-[#7C3AED] text-gray-900 hover:bg-purple-50'
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
              
              {/* Badge de poucas vagas */}
              {poucasVagas && horario !== h && (
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                  {vagas} {vagas === 1 ? 'vaga' : 'vagas'}
                </div>
              )}
            </button>
          );
        })}
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
        <div className="bg-purple-50 rounded-lg p-4 text-center">
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
          className="flex-1 py-4 px-6 rounded-lg text-lg font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
