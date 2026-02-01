const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oxakpxowhsldczxxtapi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YWtweG93aHNsZGN6eHh0YXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMzEyMTUsImV4cCI6MjA1ODYwNzIxNX0.F6kIv_MrSFS3y5IuOuj0FZkch9nIh6Xk6U4-AtZ7uWQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarAgendamento() {
  console.log('🔍 Buscando agendamentos recentes...\n');

  const { data, error } = await supabase
    .from('agendamentos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log(`✅ ${data.length} agendamentos encontrados:\n`);
    
    data.forEach((ag, index) => {
      console.log(`\n--- Agendamento ${index + 1} ---`);
      console.log('ID:', ag.id);
      console.log('Cliente:', ag.cliente);
      console.log('Telefone:', ag.telefone);
      console.log('Data/Hora:', ag.data_hora);
      console.log('Horário Término:', ag.horario_termino);
      console.log('Status:', ag.status);
      console.log('Valor Total:', ag.valor_total);
      console.log('Criar Comanda Auto:', ag.criar_comanda_automatica);
      console.log('Serviços:', JSON.stringify(ag.servicos, null, 2));
      console.log('---');
    });
  } else {
    console.log('Nenhum agendamento encontrado');
  }
}

verificarAgendamento();
