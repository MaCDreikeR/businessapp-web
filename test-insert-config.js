const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oxakpxowhsldczxxtapi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YWtweG93aHNsZGN6eHh0YXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMzEyMTUsImV4cCI6MjA1ODYwNzIxNX0.F6kIv_MrSFS3y5IuOuj0FZkch9nIh6Xk6U4-AtZ7uWQ'
);

async function test() {
  console.log('Testando SELECT direto...\n');
  
  const { data, error, count } = await supabase
    .from('configuracoes')
    .select('*', { count: 'exact' });

  console.log('Count:', count);
  console.log('Error:', error);
  console.log('Data:', data);
}

test();
