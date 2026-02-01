const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oxakpxowhsldczxxtapi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YWtweG93aHNsZGN6eHh0YXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMzEyMTUsImV4cCI6MjA1ODYwNzIxNX0.F6kIv_MrSFS3y5IuOuj0FZkch9nIh6Xk6U4-AtZ7uWQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarBuscaCliente() {
  const estabelecimentoId = '86592b4b-9872-4d52-a6bb-6458d8f53f5e';
  const telefoneDigitado = '27992671104'; // Telefone que o usuário digitou

  console.log('📞 Testando busca de cliente...');
  console.log('Telefone digitado:', telefoneDigitado);
  console.log('');

  // Buscar todos os clientes do estabelecimento
  const { data: todosClientes, error } = await supabase
    .from('clientes')
    .select('id, nome, telefone')
    .eq('estabelecimento_id', estabelecimentoId);

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  console.log(`📋 ${todosClientes.length} clientes encontrados no estabelecimento:\n`);

  // Mostrar todos os telefones e comparar
  todosClientes.forEach(cliente => {
    const telefoneLimpo = cliente.telefone?.replace(/\D/g, '') || '';
    const match = telefoneLimpo === telefoneDigitado;
    
    console.log(`${match ? '✅ MATCH' : '❌'} ${cliente.nome}`);
    console.log(`   Telefone no banco: "${cliente.telefone}"`);
    console.log(`   Telefone limpo: "${telefoneLimpo}"`);
    console.log(`   Digitado: "${telefoneDigitado}"`);
    console.log('');
  });

  // Encontrar o match
  const clienteExistente = todosClientes.find(cliente => {
    const telefoneLimpo = cliente.telefone?.replace(/\D/g, '') || '';
    return telefoneLimpo === telefoneDigitado;
  });

  if (clienteExistente) {
    console.log('🎯 RESULTADO: Cliente encontrado!');
    console.log('   ID:', clienteExistente.id);
    console.log('   Nome:', clienteExistente.nome);
  } else {
    console.log('⚠️ RESULTADO: Nenhum cliente encontrado com esse telefone');
  }
}

testarBuscaCliente();
