const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oxakpxowhsldczxxtapi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YWtweG93aHNsZGN6eHh0YXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMzEyMTUsImV4cCI6MjA1ODYwNzIxNX0.F6kIv_MrSFS3y5IuOuj0FZkch9nIh6Xk6U4-AtZ7uWQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAgendamentos() {
  console.log('🔍 Verificando estrutura da tabela agendamentos...\n');

  const { data, error } = await supabase
    .from('agendamentos')
    .select('*')
    .limit(1);

  if (data && data.length > 0) {
    console.log('✅ Campos da tabela agendamentos:');
    console.log(Object.keys(data[0]));
    console.log('\nExemplo:', JSON.stringify(data[0], null, 2));
  } else {
    console.log('Erro ou sem dados:', error);
  }
}

checkAgendamentos();
