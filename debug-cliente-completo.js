const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oxakpxowhsldczxxtapi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YWtweG93aHNsZGN6eHh0YXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMzEyMTUsImV4cCI6MjA1ODYwNzIxNX0.F6kIv_MrSFS3y5IuOuj0FZkch9nIh6Xk6U4-AtZ7uWQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarAgendamentoJoao() {
  console.log('🔍 Buscando último agendamento do João...\n');

  // Buscar agendamento do João
  const { data: agendamento } = await supabase
    .from('agendamentos')
    .select('id, cliente, telefone, cliente_id, estabelecimento_id, created_at')
    .eq('telefone', '27992671104')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!agendamento) {
    console.log('❌ Agendamento não encontrado');
    return;
  }

  console.log('📋 Agendamento encontrado:');
  console.log('   Cliente:', agendamento.cliente);
  console.log('   Telefone:', agendamento.telefone);
  console.log('   Cliente ID:', agendamento.cliente_id || 'null (não vinculado)');
  console.log('   Estabelecimento ID:', agendamento.estabelecimento_id);
  console.log('   Criado em:', agendamento.created_at);
  console.log('');

  // Buscar clientes do estabelecimento usando RLS bypass (service key se tiver)
  console.log('🔍 Buscando todos os clientes no banco (todos estabelecimentos)...\n');

  const { data: todosClientes, error } = await supabase
    .from('clientes')
    .select('id, nome, telefone, estabelecimento_id');

  if (error) {
    console.error('❌ Erro ao buscar clientes:', error);
    return;
  }

  console.log(`📋 Total de ${todosClientes?.length || 0} cliente(s) encontrados no banco\n`);

  // Filtrar por estabelecimento
  const clientesDoEstabelecimento = todosClientes?.filter(c => 
    c.estabelecimento_id === agendamento.estabelecimento_id
  );

  console.log(`📋 ${clientesDoEstabelecimento?.length || 0} cliente(s) do estabelecimento ${agendamento.estabelecimento_id}:\n`);

  if (clientesDoEstabelecimento && clientesDoEstabelecimento.length > 0) {
    clientesDoEstabelecimento.forEach((c, index) => {
      const telefoneLimpo = c.telefone?.replace(/\D/g, '') || '';
      const match = telefoneLimpo === agendamento.telefone;
      console.log(`${match ? '✅ MATCH!' : '❌'} ${index + 1}. ${c.nome}`);
      console.log(`   Telefone no banco: "${c.telefone}"`);
      console.log(`   Telefone limpo: "${telefoneLimpo}"`);
      console.log(`   Match com ${agendamento.telefone}? ${match}`);
      console.log('');
    });
  }
}

verificarAgendamentoJoao();
