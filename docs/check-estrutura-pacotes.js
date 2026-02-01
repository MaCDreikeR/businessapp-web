const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oxakpxowhsldczxxtapi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YWtweG93aHNsZGN6eHh0YXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMzEyMTUsImV4cCI6MjA1ODYwNzIxNX0.F6kIv_MrSFS3y5IuOuj0FZkch9nIh6Xk6U4-AtZ7uWQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkEstrutura() {
  console.log('🔍 Verificando estrutura da tabela pacotes...\n');

  // Tentar buscar um pacote para ver os campos
  const { data, error } = await supabase
    .from('pacotes')
    .select('*')
    .limit(1);

  if (data && data.length > 0) {
    console.log('✅ Estrutura da tabela pacotes:');
    console.log('Campos:', Object.keys(data[0]));
    console.log('\nDados:', JSON.stringify(data[0], null, 2));
  } else {
    console.log('Erro:', error);
    console.log('\nVerifique se a tabela tem dados ou se RLS está bloqueando.');
  }
}

checkEstrutura();
