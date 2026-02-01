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

async function checkEstabelecimentos() {
  console.log('🔍 Buscando estabelecimentos...\n');
  
  // Buscar todos estabelecimentos
  const { data, error, count } = await supabase
    .from('estabelecimentos')
    .select('id, nome, slug, status', { count: 'exact' })
    .order('nome');

  console.log('DEBUG - Resposta completa:');
  console.log('- Data:', data);
  console.log('- Error:', error);
  console.log('- Count:', count);
  console.log('');

  if (error) {
    console.error('❌ Erro ao buscar:', error.message);
    console.error('Código:', error.code);
    console.error('Detalhes:', error.details);
    console.error('Hint:', error.hint);
    console.log('\n⚠️  PROVÁVEL CAUSA: RLS (Row Level Security) bloqueando acesso anônimo!');
    console.log('SOLUÇÃO: Vá ao Supabase Dashboard → Authentication → Policies');
    console.log('         e crie uma política de SELECT para anonymous/public na tabela estabelecimentos.\n');
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️  Nenhum estabelecimento encontrado!');
    return;
  }

  console.log(`✅ Encontrados ${data.length} estabelecimentos:\n`);
  data.forEach((est, i) => {
    const emoji = est.status === 'ativa' ? '✅' : '❌';
    console.log(`${i + 1}. ${emoji} ${est.nome}`);
    console.log(`   Slug: ${est.slug || '(sem slug)'}`);
    console.log(`   Status: ${est.status}`);
    console.log(`   URL: http://localhost:3000/${est.slug}`);
    console.log('');
  });
}

checkEstabelecimentos().catch(console.error);
