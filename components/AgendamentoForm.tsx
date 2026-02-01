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
  }, [estabelecimento.id]);

  async function loadServicosEPacotes() {
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
  }

  async function loadProfissionais() {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('estabelecimento_id', estabelecimento.id)
      .eq('faz_atendimento', true);

    setProfissionais(data || []);
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
  return (
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

      {/* Progress Steps */}
      <div className="px-5 py-4 sm:px-8 sm:py-5 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          {['servico', 'profissional', 'data', 'horario', 'dados'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold ${
                  step === s
                    ? 'bg-blue-600 text-white'
                    : ['servico', 'profissional', 'data', 'horario', 'dados'].indexOf(step) >
                      ['servico', 'profissional', 'data', 'horario', 'dados'].indexOf(s)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {i + 1}
              </div>
              {i < 4 && <div className="w-6 sm:w-8 h-0.5 bg-gray-300 mx-1" />}
            </div>
          ))}
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
          />
        )}

        {step === 'profissional' && (
          <SelecionarProfissional
            profissionais={profissionais}
            profissionalId={profissionalId}
            onChange={setProfissionalId}
            onNext={() => setStep('data')}
            onBack={() => setStep('servico')}
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
  );
}
