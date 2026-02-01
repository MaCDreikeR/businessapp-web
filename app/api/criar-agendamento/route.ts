import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { CriarAgendamentoOnlineDTO } from '@/lib/types';

export async function POST(request: Request) {
  let body: CriarAgendamentoOnlineDTO | null = null;
  try {
    body = await request.json();
    
    console.log('📝 Dados recebidos:', JSON.stringify(body, null, 2));

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

    if (estabelecimento.status !== 'ativa') {
      return NextResponse.json(
        { error: 'Estabelecimento inativo' },
        { status: 403 }
      );
    }

    const estabelecimentoId = estabelecimento.id;

    // Verificar se agendamento online está ativo
    const { data: config } = await supabase
      .from('agendamento_online_config')
      .select('ativo')
      .eq('estabelecimento_id', estabelecimentoId)
      .single();

    if (!config?.ativo) {
      return NextResponse.json(
        { error: 'Agendamento online desativado' },
        { status: 403 }
      );
    }

    // Buscar todos os serviços e pacotes selecionados
    const servicosIds = body.servicos_ids || [];
    const pacotesIds = body.pacotes_ids || [];
    
    let servicosDetalhes = [];
    let pacotesDetalhes = [];
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
      duracaoTotal += servicos.reduce((sum, s) => sum + s.duracao, 0);
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
      duracaoTotal += pacotes.reduce((sum, p) => sum + (p.duracao_total || 0), 0);
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
        const agendamentoInicio = new Date(agendamento.data_hora).getTime();
        const agendamentoFim = new Date(`${body.data}T${agendamento.horario_termino}`).getTime();
        const novoInicio = new Date(dataHoraInicio).getTime();
        const novoFim = new Date(dataHoraFim).getTime();

        // Verifica se há sobreposição:
        // Novo começa antes do existente terminar E novo termina depois do existente começar
        if (novoInicio < agendamentoFim && novoFim > agendamentoInicio) {
          return NextResponse.json(
            { 
              error: 'Horário já está ocupado ou sobrepõe outro agendamento',
              conflito: {
                inicio: agendamento.data_hora,
                termino: agendamento.horario_termino
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
    const clienteExistente = todosClientes?.find(cliente => {
      const telefoneLimpo = cliente.telefone?.replace(/\D/g, '') || '';
      return telefoneLimpo === telefoneNumeros;
    });

    if (clienteExistente) {
      // Cliente cadastrado - usar dados dele
      console.log('✅ Cliente cadastrado encontrado:', clienteExistente.nome, '(telefone:', clienteExistente.telefone, ')');
      clienteId = clienteExistente.id;
      nomeCliente = clienteExistente.nome; // Usar o nome cadastrado no sistema
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
        data_hora: dataHora,
        horario_termino: horarioTermino,
        servicos: todosItens,
        valor_total: valorTotal,
        status: 'agendado',
        observacoes: body.observacao || null,
        criar_comanda_automatica: true, // Agendamento online cria comanda automaticamente
      })
      .select('id')
      .single();

    if (agendamentoError || !agendamento) {
      console.error('❌ Erro ao criar agendamento:', agendamentoError);
      return NextResponse.json(
        { error: 'Erro ao criar agendamento', details: agendamentoError?.message },
        { status: 500 }
      );
    }

    console.log('✅ Agendamento criado com sucesso:', agendamento.id);

    return NextResponse.json({
      success: true,
      agendamento_id: agendamento.id,
      message: 'Agendamento criado com sucesso!',
      horario_inicio: body.hora,
      horario_fim: horaFim,
      duracao_total: duracaoTotal,
      cliente_vinculado: !!clienteId,
    });

  } catch (error: any) {
    console.error('❌ Erro ao processar agendamento:', error);
    console.error('Stack:', error.stack);
    if (body) {
      console.error('Body recebido:', JSON.stringify(body));
    }
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor', details: error.toString() },
      { status: 500 }
    );
  }
}
