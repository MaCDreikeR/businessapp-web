import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Estabelecimento, AgendamentoOnlineConfig } from '@/lib/types';
import AgendamentoForm from '@/components/AgendamentoForm';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getEstabelecimento(slug: string): Promise<Estabelecimento | null> {
  const { data, error } = await supabase
    .from('estabelecimentos')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'ativa')
    .single();

  if (error) {
    console.error('❌ Erro ao buscar estabelecimento:', error);
    console.error('Slug buscado:', slug);
    return null;
  }
  
  if (!data) {
    console.log('⚠️ Nenhum estabelecimento encontrado para o slug:', slug);
    return null;
  }
  
  console.log('✅ Estabelecimento encontrado:', data.nome);
  return data;
}

async function getConfig(estabelecimentoId: string): Promise<AgendamentoOnlineConfig | null> {
  const { data, error } = await supabase
    .from('agendamento_online_config')
    .select('*')
    .eq('estabelecimento_id', estabelecimentoId)
    .single();

  if (error || !data) return null;
  return data;
}

async function getConfiguracoes(estabelecimentoId: string) {
  const { data } = await supabase
    .from('configuracoes')
    .select('chave, valor')
    .eq('estabelecimento_id', estabelecimentoId);

  const configs: Record<string, string> = {};
  data?.forEach(config => {
    configs[config.chave] = config.valor;
  });

  return {
    horarioAbertura: configs['horario_inicio'] || '08:00',
    horarioFechamento: configs['horario_fim'] || '18:00',
    intervaloAgendamento: parseInt(configs['intervalo_agendamentos'] || '30'),
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const estabelecimento = await getEstabelecimento(slug);

  if (!estabelecimento) {
    return {
      title: 'Estabelecimento não encontrado',
    };
  }

  return {
    title: `Agendar em ${estabelecimento.nome}`,
    description: `Faça seu agendamento online em ${estabelecimento.nome}`,
    openGraph: {
      title: `Agendar em ${estabelecimento.nome}`,
      description: `Faça seu agendamento online em ${estabelecimento.nome}`,
      type: 'website',
    },
  };
}

export default async function AgendarPage({ params }: PageProps) {
  const { slug } = await params;
  const estabelecimento = await getEstabelecimento(slug);

  if (!estabelecimento) {
    notFound();
  }

  const config = await getConfig(estabelecimento.id);
  const configuracoes = await getConfiguracoes(estabelecimento.id);

  // Agendamento online desativado
  if (!config || !config.ativo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {estabelecimento.logo_url && (
            <img
              src={estabelecimento.logo_url}
              alt={estabelecimento.nome}
              className="w-24 h-24 mx-auto mb-4 object-contain"
            />
          )}

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {estabelecimento.nome}
          </h1>
          
          <p className="text-gray-600 mb-6">
            O agendamento online está temporariamente desativado.
          </p>

          {estabelecimento.telefone && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Entre em contato conosco:</p>
              <a
                href={`https://wa.me/${estabelecimento.telefone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
              {estabelecimento.telefone && (
                <p className="text-sm text-gray-600">
                  {estabelecimento.telefone}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Agendamento online ativo
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:py-12 sm:px-6">
      <div className="max-w-lg mx-auto">
        <AgendamentoForm 
          estabelecimento={estabelecimento}
          config={config}
          horarioAbertura={configuracoes.horarioAbertura}
          horarioFechamento={configuracoes.horarioFechamento}
          intervaloAgendamento={configuracoes.intervaloAgendamento}
        />
      </div>
    </div>
  );
}
