const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oxakpxowhsldczxxtapi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YWtweG93aHNsZGN6eHh0YXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMzEyMTUsImV4cCI6MjA1ODYwNzIxNX0.F6kIv_MrSFS3y5IuOuj0FZkch9nIh6Xk6U4-AtZ7uWQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function buscarEstabelecimento() {
  console.log('🔍 Buscando estabelecimentos...\n');

  const { data, error } = await supabase
    .from('estabelecimentos')
    .select('id, nome, slug');

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  console.log(`📋 ${data.length} estabelecimentos encontrados:\n`);
  data.forEach(est => {
    console.log(`ID: ${est.id}`);
    console.log(`Nome: ${est.nome}`);
    console.log(`Slug: ${est.slug}`);
    console.log('---');
  });

  // Agora buscar clientes com o telefone específico
  const telefone = '27992671104';
  console.log(`\n🔍 Buscando clientes com telefone contendo "${telefone}"...\n`);

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome, telefone, estabelecimento_id');

  const clientesFiltrados = clientes?.filter(c => {
    const tel = c.telefone?.replace(/\D/g, '') || '';
    return tel === telefone;
  });

  if (clientesFiltrados && clientesFiltrados.length > 0) {
    console.log(`✅ ${clientesFiltrados.length} cliente(s) encontrado(s):\n`);
    clientesFiltrados.forEach(c => {
      console.log(`Nome: ${c.nome}`);
      console.log(`Telefone: ${c.telefone}`);
      console.log(`Estabelecimento ID: ${c.estabelecimento_id}`);
      console.log('---');
    });
  } else {
    console.log('❌ Nenhum cliente encontrado com esse telefone');
  }
}

buscarEstabelecimento();
