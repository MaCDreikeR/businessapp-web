const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oxakpxowhsldczxxtapi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YWtweG93aHNsZGN6eHh0YXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMzEyMTUsImV4cCI6MjA1ODYwNzIxNX0.F6kIv_MrSFS3y5IuOuj0FZkch9nIh6Xk6U4-AtZ7uWQ'
);

async function check() {
  const { data: estab } = await supabase
    .from('estabelecimentos')
    .select('id, nome')
    .eq('slug', 'thamaraestrias')
    .single();

  console.log('\n=== VERIFICANDO PACOTES ===');
  console.log('Estabelecimento:', estab.nome);

  const { data: pacotes, error } = await supabase
    .from('pacotes')
    .select('*')
    .eq('estabelecimento_id', estab.id);

  console.log('\nPacotes:', pacotes?.length || 0);
  console.log('Erro:', error);
  if (pacotes) console.log(JSON.stringify(pacotes, null, 2));
}

check();
