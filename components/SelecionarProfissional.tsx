'use client';

import type { Profissional } from '@/lib/types';
import { SkeletonList } from './SkeletonLoader';

interface Props {
  profissionais: Profissional[];
  profissionalId: string;
  onChange: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

export default function SelecionarProfissional({
  profissionais,
  profissionalId,
  onChange,
  onNext,
  onBack,
  loading = false,
}: Props) {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Escolha o Profissional</h2>
        <p className="text-base sm:text-lg text-gray-600 mt-2">Selecione quem você prefere</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          <SkeletonList count={3} type="profissional" />
        ) : (
          profissionais.map((prof) => (
            <button
              key={prof.id}
              onClick={() => onChange(prof.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                profissionalId === prof.id
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-offset-2'
                  : 'border-gray-300 hover:border-blue-400 bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4">
                {prof.avatar_url ? (
                  <img
                    src={prof.avatar_url}
                    alt={prof.nome_completo || 'Profissional'}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                    {prof.nome_completo?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-base sm:text-lg text-gray-900">
                    {prof.nome_completo || 'Profissional'}
                  </h4>
                  {profissionalId === prof.id && (
                    <div className="inline-flex items-center mt-1">
                      <div className="w-5 h-5 border-2 border-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-3 border-r-2 border-b-2 border-green-500 transform rotate-45 animate-checkmark" />
                      </div>
                      <span className="ml-2 text-sm text-green-600 font-medium">Selecionado</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {profissionais.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-base">
          Nenhum profissional disponível
        </div>
      )}

      {profissionalId && (
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-base sm:text-lg text-blue-900 font-medium">
            Profissional selecionado
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
          disabled={!profissionalId}
          className="flex-1 py-4 px-6 rounded-lg text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
