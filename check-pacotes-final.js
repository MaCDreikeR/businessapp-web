// Instrução: Execute primeiro o arquivo supabase-rls-pacotes.sql no Supabase
// SQL: supabase-rls-pacotes.sql
// Depois execute este script: node check-pacotes-final.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oxakpxowhsldczxxtapi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YWtweG93aHNsZGN6eHh0YXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMzEyMTUsImV4cCI6MjA1ODYwNzIxNX0.F6kIv_MrSFS3y5IuOuj0FZkch9nIh6Xk6U4-AtZ7uWQ';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPacotes() {
  console.log('🔍 Verificando pacotes após RLS...\n');

  const { data, error } = await supabase
    .from('pacotes')
    .select('*');

  console.log('Pacotes encontrados:', data?.length || 0);
  console.log('Erro:', error);
  console.log('\nDados:', JSON.stringify(data, null, 2));
}

checkPacotes();
