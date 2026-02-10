import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { CriarAgendamentoOnlineDTO } from '@/lib/types';

// Rate limiting simples em memória (para produção, usar Redis ou similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 3; // 3 requests por minuto

function getRateLimitKey(request: Request): string {
  // Usar IP real se estiver atrás de proxy
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  return `rate_limit:${ip}`;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // Novo período ou expirado
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false; // Limite excedido
  }

  record.count++;
  return true;
}

function validarTelefoneBrasileiro(telefone: string): boolean {
  // Remove todos os caracteres não numéricos
  const numeros = telefone.replace(/\D/g, '');
  
  // Aceita:
  // - 10 dígitos: (XX) XXXX-XXXX (fixo)
  // - 11 dígitos: (XX) 9XXXX-XXXX (celular)
  // - 12 dígitos: 55 XX XXXX-XXXX
  // - 13 dígitos: 55 XX 9XXXX-XXXX
  if (numeros.length < 10 || numeros.length > 13) {
    return false;
  }

  // Se tem 13 dígitos, deve começar com 55 (código do Brasil)
  if (numeros.length === 13 && !numeros.startsWith('55')) {
    return false;
  }

  // Se tem 12 dígitos, deve começar com 55 (código do Brasil)
  if (numeros.length === 12 && !numeros.startsWith('55')) {
    return false;
  }

  return true;
}

export async function POST(request: Request) {
  try {
    const body: CriarAgendamentoOnlineDTO = await request.json();
    
    console.log('📝 Dados recebidos:', JSON.stringify(body, null, 2));

    // 1. VALIDAÇÃO HONEYPOT (campo invisível que bots preenchem)
    if (body.honeypot && body.honeypot.trim() !== '') {
      console.warn('⚠️ Honeypot detectado:', body.honeypot);
      return NextResponse.json(
        { error: 'Requisição inválida' },
        { status: 400 }
      );
    }

    // 2. RATE LIMITING (prevenir spam)
    const rateLimitKey = getRateLimitKey(request);
    if (!checkRateLimit(rateLimitKey)) {
      console.warn('⚠️ Rate limit excedido:', rateLimitKey);
      return NextResponse.json(
        { error: 'Muitas requisições. Aguarde um momento e tente novamente.' },
        { status: 429 }
      );
    }

    // 3. VALIDAÇÃO DE TELEFONE BRASILEIRO
    if (!validarTelefoneBrasileiro(body.telefone)) {
      return NextResponse.json(
        { error: 'Telefone inválido. Use um número brasileiro válido.' },
        { status: 400 }
      );
    }

    // Validar campos obrigatórios
    if (!body.slug || !body.data || !body.hora || !body.profissional_id || !body.telefone || !body.nome) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    const temServicos = body.servicos_ids && body.servicos_ids.length > 0;
    const temPacotes = body.pacotes_ids && body.pacotes_ids.length > 0;

    if (!temServicos && !temPacotes) {
      return NextResponse.json(
        { error: 'Selecione pelo menos um serviço ou pacote' },
        { status: 400 }
      );
    }

    // Buscar estabelecimento pelo slug
    const { data: estabelecimento, error: estabelecimentoError } = await supabase
      .from('estabelecimentos')
      .select('id, status')
      .eq('slug', body.slug)
      .single();

    if (estabelecimentoError || !estabelecimento) {
      return NextResponse.json(
        { error: 'Estabelecimento não encontrado' },
        { status: 404 }
      );
    }

    const estab = estabelecimento as { id: string; status: string };

    if (estab.status !== 'ativa') {
      return NextResponse.json(
        { error: 'Estabelecimento inativo' },
        { status: 403 }
      );
    }

    const estabelecimentoId = estab.id;

    // Verificar se agendamento online está ativo
    const { data: config } = await supabase
      .from('agendamento_online_config')
      .select('ativo')
      .eq('estabelecimento_id', estabelecimentoId)
      .single();

    if (!(config as { ativo: boolean } | null)?.ativo) {
      return NextResponse.json(
        { error: 'Agendamento online desativado' },
        { status: 403 }
      );
    }

    // Buscar todos os serviços e pacotes selecionados
    const servicosIds = body.servicos_ids || [];
    const pacotesIds = body.pacotes_ids || [];
    
    let servicosDetalhes: any[] = [];
    let pacotesDetalhes: any[] = [];
    let duracaoTotal = 0;

    // Buscar detalhes dos serviços
    if (servicosIds.length > 0) {
      const { data: servicos, error: servicosError } = await supabase
        .from('servicos')
        .select('id, nome, duracao, preco')
        .in('id', servicosIds)
        .eq('estabelecimento_id', estabelecimentoId);

      if (servicosError || !servicos) {
        return NextResponse.json(
          { error: 'Erro ao buscar serviços' },
          { status: 500 }
        );
      }
      
      servicosDetalhes = servicos;
      duracaoTotal += servicos.reduce((sum: number, s: any) => sum + s.duracao, 0);
    }

    // Buscar detalhes dos pacotes
    if (pacotesIds.length > 0) {
      const { data: pacotes, error: pacotesError } = await supabase
        .from('pacotes')
        .select('id, nome, duracao_total, valor')
        .in('id', pacotesIds)
        .eq('estabelecimento_id', estabelecimentoId);

      if (pacotesError || !pacotes) {
        return NextResponse.json(
          { error: 'Erro ao buscar pacotes' },
          { status: 500 }
        );
      }

      pacotesDetalhes = pacotes;
      duracaoTotal += pacotes.reduce((sum: number, p: any) => sum + (p.duracao_total || 0), 0);
    }

    // Calcular horário de término
    const [hora, minuto] = body.hora.split(':').map(Number);
    const horaFimMinutos = hora * 60 + minuto + duracaoTotal;
    const horaFim = `${String(Math.floor(horaFimMinutos / 60)).padStart(2, '0')}:${String(horaFimMinutos % 60).padStart(2, '0')}`;

    // Verificar conflitos de horário
    // Busca agendamentos do mesmo profissional no mesmo dia que possam ter sobreposição
    const dataHoraInicio = `${body.data}T${body.hora}:00-03:00`;
    const dataHoraFim = `${body.data}T${horaFim}:00-03:00`;

    const { data: conflitos } = await supabase
      .from('agendamentos')
      .select('id, data_hora, horario_termino')
      .eq('estabelecimento_id', estabelecimentoId)
      .eq('usuario_id', body.profissional_id)
      .gte('data_hora', `${body.data}T00:00:00-03:00`) // Mesmo dia
      .lt('data_hora', `${body.data}T23:59:59-03:00`)
      .in('status', ['agendado', 'confirmado', 'em_atendimento']);

    if (conflitos && conflitos.length > 0) {
      // Verificar sobreposição de horários
      for (const agendamento of conflitos) {
        const ag = agendamento as any;
        const agendamentoInicio = new Date(ag.data_hora).getTime();
        const agendamentoFim = new Date(`${body.data}T${ag.horario_termino}`).getTime();
        const novoInicio = new Date(dataHoraInicio).getTime();
        const novoFim = new Date(dataHoraFim).getTime();

        // Verifica se há sobreposição:
        // Novo começa antes do existente terminar E novo termina depois do existente começar
        if (novoInicio < agendamentoFim && novoFim > agendamentoInicio) {
          return NextResponse.json(
            { 
              error: 'Horário já está ocupado ou sobrepõe outro agendamento',
              conflito: {
                inicio: ag.data_hora,
                termino: ag.horario_termino
              }
            },
            { status: 409 }
          );
        }
      }
    }

    // Buscar cliente existente pelo telefone (comparando apenas números)
    const telefoneNumeros = body.telefone.replace(/\D/g, '');
    let clienteId: string | null = null;
    let nomeCliente = body.nome;

    console.log('🔍 Buscando cliente com telefone:', telefoneNumeros);

    // Buscar todos os clientes do estabelecimento e comparar telefones limpos
    const { data: todosClientes } = await supabase
      .from('clientes')
      .select('id, nome, telefone')
      .eq('estabelecimento_id', estabelecimentoId);

    // Encontrar cliente comparando apenas números do telefone
    const clienteExistente = todosClientes?.find((cliente: any) => {
      const telefoneLimpo = cliente.telefone?.replace(/\D/g, '') || '';
      return telefoneLimpo === telefoneNumeros;
    });

    if (clienteExistente) {
      // Cliente cadastrado - usar dados dele
      const cliente = clienteExistente as any;
      console.log('✅ Cliente cadastrado encontrado:', cliente.nome, '(telefone:', cliente.telefone, ')');
      clienteId = cliente.id;
      nomeCliente = cliente.nome; // Usar o nome cadastrado no sistema
    } else {
      // Não é cliente cadastrado - agendamento sem vínculo
      console.log('➕ Agendamento para pessoa não cadastrada:', body.nome);
      clienteId = null;
      nomeCliente = body.nome; // Usar o nome que a pessoa digitou
    }

    // Criar agendamento único com todos os serviços/pacotes
    const todosItens = [
      ...servicosDetalhes.map(s => ({
        servico_id: s.id,
        nome: s.nome,
        preco: s.preco,
        quantidade: 1,
        duracao: s.duracao
      })),
      ...pacotesDetalhes.map(p => ({
        pacote_id: p.id,
        nome: p.nome,
        preco: p.valor,
        quantidade: 1,
        duracao: p.duracao_total || 0
      }))
    ];

    const valorTotal = servicosDetalhes.reduce((sum, s) => sum + s.preco, 0) +
                       pacotesDetalhes.reduce((sum, p) => sum + p.valor, 0);

    // Criar data_hora no formato com timezone Brasil (BRT/BRST)
    // Formato: "YYYY-MM-DDTHH:MM:SS-03:00" para forçar horário brasileiro
    const dataHora = `${body.data}T${body.hora}:00-03:00`;
    
    // Calcular horário de término
    const [h, m] = body.hora.split(':').map(Number);
    const minutosFim = h * 60 + m + duracaoTotal;
    const horarioTermino = `${String(Math.floor(minutosFim / 60)).padStart(2, '0')}:${String(minutosFim % 60).padStart(2, '0')}:00`;

    const { data: agendamento, error: agendamentoError } = await supabase
      .from('agendamentos')
      .insert({
        estabelecimento_id: estabelecimentoId,
        cliente_id: clienteId,
        cliente: nomeCliente,
        telefone: telefoneNumeros,
        usuario_id: body.profissional_id, // profissional que vai atender
        data_hora: dataHoraInicio,
        horario_termino: horarioTermino,
        servicos: todosItens,
        valor_total: valorTotal,
        status: 'agendado',
        observacoes: body.observacao || null,
        criar_comanda_automatica: true, // Agendamento online cria comanda automaticamente
      } as any)
      .select('id')
      .single();

    if (agendamentoError || !agendamento) {
      console.error('❌ Erro ao criar agendamento:', agendamentoError);
      return NextResponse.json(
        { error: 'Erro ao criar agendamento', details: agendamentoError?.message },
        { status: 500 }
      );
    }

    const ag = agendamento as any;
    console.log('✅ Agendamento criado com sucesso:', ag.id);

    return NextResponse.json({
      success: true,
      agendamento_id: ag.id,
      message: 'Agendamento criado com sucesso!',
      horario_inicio: body.hora,
      horario_fim: horaFim,
      duracao_total: duracaoTotal,
      cliente_vinculado: !!clienteId,
    });

  } catch (error: any) {
    console.error('❌ Erro ao processar agendamento:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor', details: error.toString() },
      { status: 500 }
    );
  }
}
