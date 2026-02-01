const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ler .env.local manualmente
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length) {
    envVars[key.trim()] = value.join('=').trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createTestEstabelecimento() {
  console.log('🔧 Criando estabelecimento de teste...\n');

  const testData = {
    nome: 'Thamara Estrías',
    slug: 'thamaraestrias',
    status: 'ativa',
    email: 'contato@thamaraestrias.com.br',
    telefone: '11999999999',
  };

  const { data, error } = await supabase
    .from('estabelecimentos')
    .insert(testData)
    .select()
    .single();

  if (error) {
    console.error('❌ Erro ao criar:', error.message);
    console.error('Código:', error.code);
    console.error('Detalhes:', error.details);
    
    if (error.code === '42501') {
      console.log('\n⚠️  PERMISSÃO NEGADA: RLS bloqueando INSERT!');
      console.log('SOLUÇÃO: Use o Supabase Dashboard ou SQL Editor para inserir dados,');
      console.log('         pois a chave ANON_KEY não tem permissão de escrita.\n');
    }
    return;
  }

  console.log('✅ Estabelecimento criado com sucesso!');
  console.log('ID:', data.id);
  console.log('Nome:', data.nome);
  console.log('Slug:', data.slug);
  console.log(`URL: http://localhost:3000/${data.slug}\n`);
}

createTestEstabelecimento().catch(console.error);
