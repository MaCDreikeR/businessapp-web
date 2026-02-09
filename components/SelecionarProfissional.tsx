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
          profissionais.map((prof, index) => {
            const delayClass = `delay-${Math.min(index * 100, 500)}`;
            return (
              <button
                key={prof.id}
                onClick={() => onChange(prof.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left hover-lift animate-fade-in-up ${delayClass} ${
                  profissionalId === prof.id
                    ? 'border-primary bg-purple-50 ring-2 ring-primary ring-offset-2'
                    : 'border-gray-300 hover:border-blue-400 bg-white'
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
                </div>
              </div>
            </button>
            );
          })
        )}
      </div>

      {profissionais.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-base">
          Nenhum profissional disponível
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
          className="flex-1 py-4 px-6 rounded-lg text-lg font-semibold bg-primary text-white hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
