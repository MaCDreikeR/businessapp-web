'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { colors } from '@/lib/theme';
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
import BookingSummaryDesktop from './BookingSummaryDesktop';
import { getServicoIcon } from './ServicoIcons';
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
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.primary }}></div>
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
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-left space-y-2 mb-6">
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
          className="text-white font-medium py-3 px-6 rounded-lg transition-colors"
          style={{ backgroundColor: colors.primary }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primaryDark}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}
        >
          Fazer Novo Agendamento
        </button>
      </div>
    );
  }

  // Formulário principal
  const currentStepNumber = ['servico', 'profissional', 'data', 'horario', 'dados'].indexOf(step) + 1;
  const servicosSelecionados = servicos.filter(s => servicosIds.includes(s.id));
  const pacotesSelecionados = pacotes.filter(p => pacotesIds.includes(p.id));
  const totalPreco = servicosSelecionados.reduce((sum, s) => sum + (s.preco || 0), 0) + pacotesSelecionados.reduce((sum, p) => sum + (p.valor || 0), 0);
  const totalDuracao = servicosSelecionados.reduce((sum, s) => sum + (s.duracao || 0), 0) + pacotesSelecionados.reduce((sum, p) => sum + (p.duracao_total || 0), 0);
  const profissionalSelecionado = profissionais.find(p => p.id === profissionalId);
  const todosItensSelecionados = [...servicosSelecionados.map(s => s.nome), ...pacotesSelecionados.map(p => p.nome)];

  // Debug para ver o estado
  console.log('📊 Estado do resumo:', {
    servicosSelecionados,
    pacotesSelecionados,
    totalPreco,
    totalDuracao,
    profissionalId,
    profissionalSelecionado,
  });

  return (
    <>
      {/* Resumo Desktop - lateral direita ao lado do formulário */}
      <div className="hidden xl:block fixed left-1/2 top-0 ml-[280px] w-[320px] z-10">
        <BookingSummaryDesktop
          servicos={[...servicosSelecionados, ...pacotesSelecionados]}
          profissional={profissionalSelecionado || null}
          data={data}
          horario={horario}
          currentStep={currentStepNumber}
        />
      </div>

      {/* Formulário principal */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full">
            {/* Header com Glassmorphism */}
            <div className="glass-effect px-4 py-3 text-white relative">
              <div className="flex items-center gap-3">
                {estabelecimento.logo_url && (
                  <img
                    src={estabelecimento.logo_url}
                    alt={estabelecimento.nome}
                    className="w-12 h-12 rounded-full bg-white p-1 object-contain shadow-lg"
                  />
                )}
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold drop-shadow-md">{estabelecimento.nome}</h1>
                  <p className="text-xl text-purple-100">Agendamento online</p>
                </div>
              </div>
            </div>

            {/* Progress Bar - Sticky no mobile */}
            <div className="relative z-30 px-4 py-2.5 bg-white border-b shadow-md md:shadow-none">
        
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-600">
            Etapa {currentStepNumber} de 5
          </span>
          <span className="text-sm font-medium" style={{ color: colors.primary }}>
            {currentStepNumber * 20}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="h-2 transition-all duration-500 ease-out rounded-full"
            style={{ 
              width: `${currentStepNumber * 20}%`,
              background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryDark})`
            }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-sm">
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

    {/* Resumo Mobile - Modal flutuante saindo do botão */}
    <div className="xl:hidden">
      {currentStepNumber >= 2 && todosItensSelecionados.length > 0 && (
        <>
          {/* Botão flutuante */}
          <button
            onClick={() => setShowMobileDrawer(!showMobileDrawer)}
            className="fixed right-4 bottom-24 z-50 bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            aria-label="Ver resumo do agendamento"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {todosItensSelecionados.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {todosItensSelecionados.length}
              </span>
            )}
          </button>

          {/* Backdrop sutil */}
          {showMobileDrawer && (
            <div
              className="fixed inset-0 bg-black/30 z-40 transition-opacity backdrop-blur-[2px]"
              onClick={() => setShowMobileDrawer(false)}
            />
          )}

          {/* Modal flutuante - Parece sair do botão */}
          <div
            className={`fixed bottom-[120px] right-4 w-[calc(100vw-2rem)] max-w-[380px] bg-white rounded-2xl shadow-2xl z-50 transform transition-all duration-300 ease-out overflow-hidden ${
              showMobileDrawer ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'
            }`}
            style={{
              transformOrigin: 'bottom right',
              boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Header minimalista */}
            <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Resumo do Agendamento</h2>
              <button
                onClick={() => setShowMobileDrawer(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-5 space-y-4">
              {/* Serviços/Pacotes */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Serviços</h3>
                </div>
                {servicosSelecionados.map((servico) => (
                  <div key={servico.id} className="flex justify-between items-start py-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{servico.nome}</p>
                      <p className="text-sm text-gray-500 mt-0.5 font-medium">
                        {Math.floor(servico.duracao / 60)}h {servico.duracao % 60}min
                      </p>
                    </div>
                    <p className="font-bold text-secondary ml-3 text-sm whitespace-nowrap">
                      R$ {servico.preco.toFixed(2)}
                    </p>
                  </div>
                ))}
                {pacotesSelecionados.map((pacote) => (
                  <div key={pacote.id} className="flex justify-between items-start py-2 bg-purple-50 -mx-2 px-2 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-medium text-gray-900 text-sm">{pacote.nome}</p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-primary text-white rounded">
                          PACOTE
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5 font-medium">
                        {Math.floor(pacote.duracao_total / 60)}h {pacote.duracao_total % 60}min
                      </p>
                    </div>
                    <p className="font-bold text-secondary ml-3 text-sm whitespace-nowrap">
                      R$ {pacote.valor.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Profissional */}
              {profissionalSelecionado && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Profissional</h3>
                  </div>
                  <p className="text-gray-900 font-medium text-sm">{profissionalSelecionado.nome_completo}</p>
                </div>
              )}

              {/* Data e Horário */}
              {data && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Data e Horário</h3>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-gray-900 font-medium text-sm">
                      {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      }).replace(/^\w/, c => c.toUpperCase())}
                    </p>
                    {horario && (
                      <p className="text-gray-600 text-sm">
                        {horario} - {(() => {
                          const [h, m] = horario.split(':').map(Number);
                          const totalMinutos = h * 60 + m + totalDuracao;
                          const horaFim = Math.floor(totalMinutos / 60);
                          const minutoFim = totalMinutos % 60;
                          return `${String(horaFim).padStart(2, '0')}:${String(minutoFim).padStart(2, '0')}`;
                        })()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Total fixo no rodapé */}
            <div className="border-t-2 border-gray-100 bg-gray-50 px-5 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                      <p className="text-sm text-gray-500 font-semibold">Total</p>
                    <p className="text-sm text-gray-500 mt-0.5 font-medium">
                      {Math.floor(totalDuracao / 60)}h {totalDuracao % 60}min
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-secondary">
                  R$ {totalPreco.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
</>
  );
}
