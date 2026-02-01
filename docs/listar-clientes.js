const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oxakpxowhsldczxxtapi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YWtweG93aHNsZGN6eHh0YXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMzEyMTUsImV4cCI6MjA1ODYwNzIxNX0.F6kIv_MrSFS3y5IuOuj0FZkch9nIh6Xk6U4-AtZ7uWQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listarTodosClientes() {
  const estabelecimentoId = '86592b4b-9872-4d52-a6bb-6458d8f53f5e'; // Thamara Estrias

  console.log('📋 Listando TODOS os clientes do estabelecimento Thamara Estrias:\n');

  const { data: clientes, error } = await supabase
    .from('clientes')
    .select('id, nome, telefone')
    .eq('estabelecimento_id', estabelecimentoId);

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  if (!clientes || clientes.length === 0) {
    console.log('❌ Nenhum cliente encontrado');
    return;
  }

  console.log(`✅ ${clientes.length} cliente(s) encontrado(s):\n`);
  
  clientes.forEach((c, index) => {
    const telefoneLimpo = c.telefone?.replace(/\D/g, '') || '';
    console.log(`${index + 1}. ${c.nome}`);
    console.log(`   Telefone original: "${c.telefone}"`);
    console.log(`   Telefone limpo: "${telefoneLimpo}"`);
    console.log(`   ID: ${c.id}`);
    console.log('');
  });
}

listarTodosClientes();
