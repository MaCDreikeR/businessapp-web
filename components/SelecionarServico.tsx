'use client';

import { useState, useMemo } from 'react';
import type { Servico, Pacote } from '@/lib/types';
import { SkeletonList } from './SkeletonLoader';

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
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Serviços ({servicos.length})
        </button>
        <button
          onClick={() => setActiveTab('pacotes')}
          className={`flex-1 py-3 px-4 text-base font-semibold transition-all ${
            activeTab === 'pacotes'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
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
              servicosFiltrados.map((servico) => {
                const selecionado = servicosIds.includes(servico.id);
                return (
                  <button
                    key={servico.id}
                    onClick={() => toggleServico(servico.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selecionado
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-offset-2 shadow-lg'
                        : 'border-gray-300 hover:border-blue-400 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        selecionado ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                      }`}>
                        {selecionado && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-base sm:text-lg text-gray-900">{servico.nome}</h4>
                          {servico.descricao && (
                            <p className="text-sm text-gray-600 mt-1">{servico.descricao}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-2">
                            ⏱️ {servico.duracao} min
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-lg text-blue-600">
                            R$ {servico.preco.toFixed(2)}
                          </p>
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
              pacotesFiltrados.map((pacote) => {
                const selecionado = pacotesIds.includes(pacote.id);
                return (
                  <button
                    key={pacote.id}
                    onClick={() => togglePacote(pacote.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selecionado
                        ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600 ring-offset-2 shadow-lg'
                        : 'border-gray-300 hover:border-purple-400 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        selecionado ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                      }`}>
                        {selecionado && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-base sm:text-lg text-gray-900">{pacote.nome}</h4>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                              PACOTE
                            </span>
                          </div>
                          {pacote.descricao && (
                            <p className="text-sm text-gray-600 mt-1">{pacote.descricao}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-2">
                            ⏱️ {pacote.duracao_total || 0} min
                            {!pacote.duracao_total && (
                              <span className="ml-2 text-xs text-orange-600">(⚠️ duração não definida)</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-lg text-purple-600">
                            R$ {pacote.valor.toFixed(2)}
                          </p>
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
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-2">Resumo da Seleção</h3>
          <div className="space-y-1 text-sm">
            {servicosSelecionados.map(s => (
              <div key={s.id} className="flex justify-between text-gray-700">
                <span>• {s.nome}</span>
                <span>R$ {s.preco.toFixed(2)}</span>
              </div>
            ))}
            {pacotesSelecionados.map(p => (
              <div key={p.id} className="flex justify-between text-gray-700">
                <span>• {p.nome} <span className="text-xs text-purple-600">(PACOTE)</span></span>
                <span>R$ {p.valor.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-300">
            <div className="flex justify-between font-bold text-base text-gray-900">
              <span>Total: {duracaoTotal} min</span>
              <span>R$ {valorTotal.toFixed(2)}</span>
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
          className="flex-1 py-4 px-6 rounded-lg text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
