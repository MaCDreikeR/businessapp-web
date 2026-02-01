const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oxakpxowhsldczxxtapi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YWtweG93aHNsZGN6eHh0YXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMzEyMTUsImV4cCI6MjA1ODYwNzIxNX0.F6kIv_MrSFS3y5IuOuj0FZkch9nIh6Xk6U4-AtZ7uWQ'
);

async function checkHorarios() {
  // Buscar estabelecimento
  const { data: estab, error: estabError } = await supabase
    .from('estabelecimentos')
    .select('id, nome, slug')
    .eq('slug', 'thamaraestrias')
    .single();

  if (estabError) {
    console.error('Erro ao buscar estabelecimento:', estabError);
    return;
  }

  console.log('\n=== VERIFICANDO USUARIOS/PROFISSIONAIS ===');
  
  // Buscar usuarios que fazem atendimento
  const { data: usuarios } = await supabase
    .from('usuarios')
    .select('*')
    .eq('estabelecimento_id', estab.id)
    .eq('faz_atendimento', true);

  console.log('\nUsuários que fazem atendimento:');
  if (usuarios && usuarios.length > 0) {
    console.log(JSON.stringify(usuarios, null, 2));
  } else {
    console.log('Nenhum usuário encontrado');
  }

  console.log('\n================================\n');
}

checkHorarios();
