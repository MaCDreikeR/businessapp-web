'use client';

import { useState, useMemo } from 'react';
import { colors } from '@/lib/theme';
import type { Servico, Pacote } from '@/lib/types';
import { SkeletonList } from './SkeletonLoader';
import { getServicoIcon, formatDuracao } from './ServicoIcons';

interface Props {
  servicos: Servico[];
  pacotes: Pacote[];
  servicosIds: string[];
  pacotesIds: string[];
  onChangeServicos: (ids: string[]) => void;
  onChangePacotes: (ids: string[]) => void;
  onNext: () => void;
  onBack?: () => void;
  loading?: boolean;
}

export default function SelecionarServico({
  servicos,
  pacotes,
  servicosIds,
  pacotesIds,
  onChangeServicos,
  onChangePacotes,
  onNext,
  onBack,
  loading = false,
}: Props) {
  const [activeTab, setActiveTab] = useState<'servicos' | 'pacotes'>('servicos');
  const [buscaServicos, setBuscaServicos] = useState('');
  const [buscaPacotes, setBuscaPacotes] = useState('');

  const temSelecao = servicosIds.length > 0 || pacotesIds.length > 0;

  // Filtrar serviços
  const servicosFiltrados = useMemo(() => {
    if (!buscaServicos.trim()) return servicos;
    const termo = buscaServicos.toLowerCase();
    return servicos.filter(s => 
      s.nome.toLowerCase().includes(termo) || 
      s.descricao?.toLowerCase().includes(termo)
    );
  }, [servicos, buscaServicos]);

  // Filtrar pacotes
  const pacotesFiltrados = useMemo(() => {
    if (!buscaPacotes.trim()) return pacotes;
    const termo = buscaPacotes.toLowerCase();
    return pacotes.filter(p => 
      p.nome.toLowerCase().includes(termo) || 
      p.descricao?.toLowerCase().includes(termo)
    );
  }, [pacotes, buscaPacotes]);

  // Toggle serviço
  function toggleServico(id: string) {
    if (servicosIds.includes(id)) {
      onChangeServicos(servicosIds.filter(sid => sid !== id));
    } else {
      onChangeServicos([...servicosIds, id]);
    }
  }

  // Toggle pacote
  function togglePacote(id: string) {
    if (pacotesIds.includes(id)) {
      onChangePacotes(pacotesIds.filter(pid => pid !== id));
    } else {
      onChangePacotes([...pacotesIds, id]);
    }
  }

  // Calcular totais
  const servicosSelecionados = servicos.filter(s => servicosIds.includes(s.id));
  const pacotesSelecionados = pacotes.filter(p => pacotesIds.includes(p.id));
  
  const valorTotal = 
    servicosSelecionados.reduce((sum, s) => sum + s.preco, 0) +
    pacotesSelecionados.reduce((sum, p) => sum + p.valor, 0);
  
  const duracaoTotal = 
    servicosSelecionados.reduce((sum, s) => sum + s.duracao, 0) +
    pacotesSelecionados.reduce((sum, p) => sum + (p.duracao_total || 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Escolha os Serviços</h2>
        <p className="text-base sm:text-lg text-gray-600 mt-2">Selecione um ou mais itens</p>
      </div>

      {/* Abas */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('servicos')}
          className={`flex-1 py-3 px-4 text-base font-semibold transition-all ${
            activeTab === 'servicos'
              ? 'border-b-2'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          style={activeTab === 'servicos' ? { color: colors.primary, borderColor: colors.primary } : undefined}
        >
          Serviços ({servicos.length})
        </button>
        <button
          onClick={() => setActiveTab('pacotes')}
          className={`flex-1 py-3 px-4 text-base font-semibold transition-all ${
            activeTab === 'pacotes'
              ? 'border-b-2'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          style={activeTab === 'pacotes' ? { color: colors.primary, borderColor: colors.primary } : undefined}
        >
          Pacotes ({pacotes.length})
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'servicos' && (
        <div className="space-y-4">
          {/* Campo de Busca Serviços */}
          <div className="relative">
            <input
              type="text"
              value={buscaServicos}
              onChange={(e) => setBuscaServicos(e.target.value)}
              placeholder="Buscar serviço..."
              className="w-full py-3 px-4 pr-10 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
            />
            <svg 
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Lista de Serviços */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <SkeletonList count={4} type="servico" />
            ) : servicosFiltrados.length > 0 ? (
              servicosFiltrados.map((servico, index) => {
                const selecionado = servicosIds.includes(servico.id);
                const delayClass = `delay-${Math.min(index * 75, 500)}`;
                return (
                  <button
                    key={servico.id}
                    onClick={() => toggleServico(servico.id)}
                    className={`w-full text-left p-5 rounded-xl transition-all duration-200 hover-lift animate-fade-in-up ${delayClass} ${
                      selecionado
                        ? 'bg-purple-50 border-l-4 border-[#7C3AED] shadow-sm'
                        : 'bg-white hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Ícone do Serviço */}
                      <div className={`p-2.5 rounded-lg transition-colors ${
                        selecionado ? 'bg-purple-100 text-[#7C3AED]' : 'bg-gray-50 text-gray-500'
                      }`}>
                        {getServicoIcon(servico.nome)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4 mb-1">
                          <h4 className="font-semibold text-base text-gray-900 truncate">
                            {servico.nome}
                          </h4>
                          <p className={`font-semibold text-base whitespace-nowrap ${
                            selecionado ? 'text-[#10B981]' : 'text-[#10B981]'
                          }`}>
                            R$ {servico.preco.toFixed(2)}
                          </p>
                        </div>
                        
                        {servico.descricao && (
                          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{servico.descricao}</p>
                        )}
                        
                        {/* Duração */}
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs">{formatDuracao(servico.duracao)}</span>
                          
                          {/* Check sutil quando selecionado */}
                          {selecionado && (
                            <>
                              <span className="mx-1.5 text-gray-300">•</span>
                              <svg className="w-4 h-4 text-[#7C3AED]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-[#7C3AED] font-medium">Selecionado</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                {buscaServicos ? 'Nenhum serviço encontrado' : 'Nenhum serviço disponível'}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'pacotes' && (
        <div className="space-y-4">
          {/* Campo de Busca Pacotes */}
          <div className="relative">
            <input
              type="text"
              value={buscaPacotes}
              onChange={(e) => setBuscaPacotes(e.target.value)}
              placeholder="Buscar pacote..."
              className="w-full py-3 px-4 pr-10 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-base"
            />
            <svg 
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Lista de Pacotes */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pacotesFiltrados.length > 0 ? (
              pacotesFiltrados.map((pacote, index) => {
                const selecionado = pacotesIds.includes(pacote.id);
                const delayClass = `delay-${Math.min(index * 75, 500)}`;
                return (
                  <button
                    key={pacote.id}
                    onClick={() => togglePacote(pacote.id)}
                    className={`w-full text-left p-5 rounded-xl transition-all duration-200 hover-lift animate-fade-in-up ${delayClass} ${
                      selecionado
                        ? 'bg-purple-50 border-l-4 border-purple-600 shadow-sm'
                        : 'bg-white hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Ícone do Pacote */}
                      <div className={`p-2.5 rounded-lg transition-colors ${
                        selecionado ? 'bg-purple-100 text-purple-600' : 'bg-gray-50 text-gray-500'
                      }`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4 mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-base text-gray-900 truncate">{pacote.nome}</h4>
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-semibold rounded uppercase tracking-wide">
                              Pacote
                            </span>
                          </div>
                          <p className={`font-semibold text-base whitespace-nowrap ${
                            selecionado ? 'text-[#10B981]' : 'text-[#10B981]'
                          }`}>
                            R$ {pacote.valor.toFixed(2)}
                          </p>
                        </div>
                        
                        {pacote.descricao && (
                          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{pacote.descricao}</p>
                        )}
                        
                        {/* Duração */}
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs">
                            {pacote.duracao_total ? formatDuracao(pacote.duracao_total) : (
                              <span className="text-orange-500">Duração não definida</span>
                            )}
                          </span>
                          
                          {/* Check sutil quando selecionado */}
                          {selecionado && (
                            <>
                              <span className="mx-1.5 text-gray-300">•</span>
                              <svg className="w-4 h-4 text-[#7C3AED]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-[#7C3AED] font-medium">Selecionado</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                {buscaPacotes ? 'Nenhum pacote encontrado' : 'Nenhum pacote disponível'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resumo da Seleção */}
      {temSelecao && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Resumo da Seleção</h3>
          <div className="space-y-2">
            {servicosSelecionados.map(s => (
              <div key={s.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">• {s.nome}</span>
                <span className="font-medium text-[#10B981]">R$ {s.preco.toFixed(2)}</span>
              </div>
            ))}
            {pacotesSelecionados.map(p => (
              <div key={p.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">
                  • {p.nome} 
                  <span className="ml-1.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-semibold rounded uppercase">
                    Pacote
                  </span>
                </span>
                <span className="font-medium text-[#10B981]">R$ {p.valor.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Total: <span className="font-medium text-gray-900">{duracaoTotal} min</span>
              </div>
              <div className="text-lg font-bold text-[#10B981]">
                R$ {valorTotal.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 py-4 px-6 rounded-lg text-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Voltar
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!temSelecao}
          className="flex-1 py-4 px-6 rounded-lg text-lg font-semibold text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          style={{ backgroundColor: colors.primary }}
          onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = colors.primaryDark)}
          onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = colors.primary)}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
