'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  Estabelecimento,
  AgendamentoOnlineConfig,
  Servico,
  Pacote,
  Profissional,
  CriarAgendamentoOnlineDTO,
} from '@/lib/types';
import SelecionarData from './SelecionarData';
import SelecionarHorario from './SelecionarHorario';
import SelecionarServico from './SelecionarServico';
import SelecionarProfissional from './SelecionarProfissional';
import DadosCliente from './DadosCliente';
import StickyBookingSummary from './StickyBookingSummary';
import { Session } from '@supabase/supabase-js';

interface Props {
  estabelecimento: Estabelecimento;
  config: AgendamentoOnlineConfig;
  horarioAbertura: string;
  horarioFechamento: string;
  intervaloAgendamento: number;
}

type Step = 'data' | 'horario' | 'profissional' | 'servico' | 'dados' | 'confirmacao';

export default function AgendamentoForm({ estabelecimento, config, horarioAbertura, horarioFechamento, intervaloAgendamento }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('servico');
  
  // Estados do formulário
  const [servicosIds, setServicosIds] = useState<string[]>([]);
  const [pacotesIds, setPacotesIds] = useState<string[]>([]);
  const [profissionalId, setProfissionalId] = useState<string>('');
  const [data, setData] = useState<string>('');
  const [horario, setHorario] = useState<string>('');
  const [nome, setNome] = useState<string>('');
  const [telefone, setTelefone] = useState<string>('');
  const [observacao, setObservacao] = useState<string>('');

  // Dados carregados
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [pacotes, setPacotes] = useState<Pacote[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [antecedenciaMinima, setAntecedenciaMinima] = useState<number>(2); // padrão 2 horas
  
  // Estados de loading
  const [loadingServicos, setLoadingServicos] = useState(true);
  const [loadingProfissionais, setLoadingProfissionais] = useState(true);

  // Estados de envio
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // Verificar autenticação
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carregar dados
  useEffect(() => {
    loadServicosEPacotes();
    loadProfissionais();
    loadAntecedenciaMinima();
  }, [estabelecimento.id]);

  async function loadServicosEPacotes() {
    setLoadingServicos(true);
    const [{ data: servicosData }, { data: pacotesData }] = await Promise.all([
      supabase
        .from('servicos')
        .select('*')
        .eq('estabelecimento_id', estabelecimento.id),
      supabase
        .from('pacotes')
        .select('*')
        .eq('estabelecimento_id', estabelecimento.id),
    ]);

    setServicos(servicosData || []);
    setPacotes(pacotesData || []);
    setLoadingServicos(false);
  }

  async function loadProfissionais() {
    setLoadingProfissionais(true);
    const { data } = await supabase
      .from('usuarios')
      .select('id, nome_completo, avatar_url, email, faz_atendimento, estabelecimento_id')
      .eq('estabelecimento_id', estabelecimento.id)
      .eq('faz_atendimento', 'true');

    console.log('🔍 Profissionais carregados:', data);
    setProfissionais(data || []);
    setLoadingProfissionais(false);
  }

  async function loadAntecedenciaMinima() {
    const { data } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('estabelecimento_id', estabelecimento.id)
      .eq('chave', 'agendamento_online_antecedencia_horas')
      .single();

    const config = data as any;
    if (config?.valor) {
      const horas = parseInt(config.valor, 10);
      if (!isNaN(horas) && horas >= 0) {
        setAntecedenciaMinima(horas);
      }
    }
  }

  // Calcular duração total dos itens selecionados
  function calcularDuracaoTotal(): number {
    let total = 0;
    
    // Somar duração dos serviços
    servicosIds.forEach(id => {
      const servico = servicos.find(s => s.id === id);
      if (servico) total += servico.duracao;
    });
    
    // Somar duração dos pacotes
    pacotesIds.forEach(id => {
      const pacote = pacotes.find(p => p.id === id);
      if (pacote) total += pacote.duracao_total || 0;
    });
    
    return total;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');

    try {
      const payload: CriarAgendamentoOnlineDTO = {
        slug: estabelecimento.slug,
        data,
        hora: horario,
        profissional_id: profissionalId,
        servicos_ids: servicosIds.length > 0 ? servicosIds : undefined,
        pacotes_ids: pacotesIds.length > 0 ? pacotesIds : undefined,
        nome,
        telefone,
        observacao: observacao || undefined,
      };

      const response = await fetch('/api/criar-agendamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar agendamento');
      }

      setSuccess(true);
      setStep('confirmacao');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar agendamento');
    } finally {
      setSubmitting(false);
    }
  }

  // Verificar se precisa de login
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Login não obrigatório - agendamento sempre público quando ativo

  // Página de sucesso
  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Agendamento Confirmado! 🎉
        </h2>
        <p className="text-gray-600 mb-6">
          Você receberá uma confirmação no WhatsApp em breve.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left space-y-2 mb-6">
          <p className="text-sm text-gray-700">
            <strong>Estabelecimento:</strong> {estabelecimento.nome}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Data:</strong> {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Horário:</strong> {horario}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Fazer Novo Agendamento
        </button>
      </div>
    );
  }

  // Formulário principal
  const currentStepNumber = ['servico', 'profissional', 'data', 'horario', 'dados'].indexOf(step) + 1;
  const servicosSelecionados = servicos.filter(s => servicosIds.includes(s.id));
  const totalPreco = servicosSelecionados.reduce((sum, s) => sum + s.preco, 0);
  const totalDuracao = servicosSelecionados.reduce((sum, s) => sum + s.duracao, 0);
  const profissionalSelecionado = profissionais.find(p => p.id === profissionalId);

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-5 py-4 sm:px-8 sm:py-6 text-white">
          <div className="flex items-center gap-4">
            {estabelecimento.logo_url && (
              <img
                src={estabelecimento.logo_url}
                alt={estabelecimento.nome}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1 object-contain"
              />
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{estabelecimento.nome}</h1>
            <p className="text-sm sm:text-base text-blue-100">Agendamento online</p>
          </div>
        </div>
      </div>

      {/* Progress Bar - Sticky no mobile */}
      <div className="sticky top-0 md:relative z-30 px-5 py-3 sm:px-8 sm:py-4 bg-white border-b shadow-md md:shadow-none">
        {/* Resumo compacto - só mobile e a partir da etapa 2 */}
        {currentStepNumber >= 2 && servicosSelecionados.length > 0 && (
          <div className="md:hidden mb-3 pb-3 border-b border-gray-200 space-y-2">
            {/* Serviços */}
            <div className="flex items-start gap-2 text-xs">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium truncate">{servicosSelecionados.map(s => s.nome).join(', ')}</p>
                <p className="text-gray-500">{Math.floor(totalDuracao / 60)}h {totalDuracao % 60}min • R$ {totalPreco.toFixed(2)}</p>
              </div>
            </div>

            {/* Profissional */}
            {profissionalSelecionado && (
              <div className="flex items-center gap-2 text-xs">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-gray-900">{profissionalSelecionado.nome}</p>
              </div>
            )}

            {/* Data e Horário */}
            {data && (
              <div className="flex items-center gap-2 text-xs">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-900">
                  {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  {horario && ` às ${horario}`}
                </p>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Etapa {currentStepNumber} de 5
          </span>
          <span className="text-sm font-medium text-blue-600">
            {currentStepNumber * 20}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 transition-all duration-500 ease-out rounded-full"
            style={{ 
              width: `${currentStepNumber * 20}%` 
            }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="p-5 sm:p-8">
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-base">
            {error}
          </div>
        )}

        {step === 'servico' && (
          <SelecionarServico
            servicos={servicos}
            pacotes={pacotes}
            servicosIds={servicosIds}
            pacotesIds={pacotesIds}
            onChangeServicos={setServicosIds}
            onChangePacotes={setPacotesIds}
            onNext={() => setStep('profissional')}
            onBack={undefined}
            loading={loadingServicos}
          />
        )}

        {step === 'profissional' && (
          <SelecionarProfissional
            profissionais={profissionais}
            profissionalId={profissionalId}
            onChange={setProfissionalId}
            onNext={() => setStep('data')}
            onBack={() => setStep('servico')}
            loading={loadingProfissionais}
          />
        )}

        {step === 'data' && (
          <SelecionarData
            data={data}
            onChange={setData}
            onNext={() => setStep('horario')}
            onBack={() => setStep('profissional')}
          />
        )}

        {step === 'horario' && (
          <SelecionarHorario
            data={data}
            horario={horario}
            onChange={setHorario}
            onNext={() => setStep('dados')}
            onBack={() => setStep('data')}
            estabelecimentoId={estabelecimento.id}
            profissionalId={profissionalId}
            duracaoTotal={calcularDuracaoTotal()}
            horarioAbertura={horarioAbertura}
            horarioFechamento={horarioFechamento}
            intervaloAgendamento={intervaloAgendamento}
            antecedenciaMinima={antecedenciaMinima}
          />
        )}

        {step === 'dados' && (
          <DadosCliente
            nome={nome}
            telefone={telefone}
            observacao={observacao}
            permiteObservacao={true}
            onChangeNome={setNome}
            onChangeTelefone={setTelefone}
            onChangeObservacao={setObservacao}
            onSubmit={handleSubmit}
            onBack={() => setStep('horario')}
            submitting={submitting}
          />
        )}
      </div>
    </div>
    </>
  );
}
