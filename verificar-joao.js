const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oxakpxowhsldczxxtapi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YWtweG93aHNsZGN6eHh0YXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMzEyMTUsImV4cCI6MjA1ODYwNzIxNX0.F6kIv_MrSFS3y5IuOuj0FZkch9nIh6Xk6U4-AtZ7uWQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarAgendamentoJoao() {
  console.log('🔍 Verificando agendamento do João...\n');

  const { data: agendamento } = await supabase
    .from('agendamentos')
    .select('*')
    .ilike('cliente', '%joao%')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!agendamento) {
    console.log('❌ Agendamento não encontrado');
    return;
  }

  console.log('📋 Agendamento:');
  console.log('   Cliente:', agendamento.cliente);
  console.log('   Telefone:', agendamento.telefone);
  console.log('   Cliente ID:', agendamento.cliente_id);
  console.log('   Estabelecimento ID:', agendamento.estabelecimento_id);
  console.log('');

  // Agora buscar clientes desse estabelecimento
  console.log('🔍 Buscando clientes do estabelecimento...\n');

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome, telefone')
    .eq('estabelecimento_id', agendamento.estabelecimento_id);

  console.log(`📋 ${clientes?.length || 0} cliente(s) encontrado(s):\n`);

  if (clientes && clientes.length > 0) {
    clientes.forEach((c, index) => {
      const telefoneLimpo = c.telefone?.replace(/\D/g, '') || '';
      const match = telefoneLimpo === agendamento.telefone;
      console.log(`${match ? '✅ MATCH' : '❌'} ${index + 1}. ${c.nome}`);
      console.log(`   Telefone: "${c.telefone}" → limpo: "${telefoneLimpo}"`);
      console.log('');
    });
  }
}

verificarAgendamentoJoao();
