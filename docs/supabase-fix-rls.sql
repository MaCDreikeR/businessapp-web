-- ============================================
-- FIX: Liberar acesso público para agendamento online
-- ============================================
-- Execute este script no Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Cole e Execute
-- ============================================

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Acesso público para agendamento online" ON public.estabelecimentos;
DROP POLICY IF EXISTS "Leitura pública de config agendamento" ON public.agendamento_online_config;
DROP POLICY IF EXISTS "Leitura pública de serviços" ON public.servicos;
DROP POLICY IF EXISTS "Leitura pública de usuarios profissionais" ON public.usuarios;
DROP POLICY IF EXISTS "Leitura pública de agendamentos para conflitos" ON public.agendamentos;
DROP POLICY IF EXISTS "Permitir auto-cadastro de clientes" ON public.clientes;
DROP POLICY IF EXISTS "Permitir criação pública de agendamentos" ON public.agendamentos;

-- 1. Permitir leitura pública de estabelecimentos ativos (para página de agendamento)
CREATE POLICY "Acesso público para agendamento online"
ON public.estabelecimentos
FOR SELECT
TO anon, authenticated
USING (status = 'ativa' AND slug IS NOT NULL);

-- 2. Permitir leitura pública da configuração de agendamento
CREATE POLICY "Leitura pública de config agendamento"
ON public.agendamento_online_config
FOR SELECT
TO anon, authenticated
USING (ativo = true);

-- 3. Permitir leitura pública de serviços (para seleção no formulário)
CREATE POLICY "Leitura pública de serviços"
ON public.servicos
FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Permitir leitura pública de usuários que fazem atendimento (profissionais)
CREATE POLICY "Leitura pública de usuarios profissionais"
ON public.usuarios
FOR SELECT
TO anon, authenticated
USING (faz_atendimento = true);

-- 5. Permitir leitura pública de agendamentos (para verificar conflitos de horário)
CREATE POLICY "Leitura pública de agendamentos para conflitos"
ON public.agendamentos
FOR SELECT
TO anon, authenticated
USING (status != 'CANCELADO');

-- 6. Permitir inserção pública de clientes (auto-cadastro no agendamento)
CREATE POLICY "Permitir auto-cadastro de clientes"
ON public.clientes
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 7. Permitir inserção pública de agendamentos (criação pelo formulário)
CREATE POLICY "Permitir criação pública de agendamentos"
ON public.agendamentos
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 8. Permitir leitura pública de configurações (horários, intervalos, etc)
DROP POLICY IF EXISTS "Leitura pública de configurações" ON public.configuracoes;
CREATE POLICY "Leitura pública de configurações"
ON public.configuracoes
FOR SELECT
TO anon, authenticated
USING (true);

-- ============================================
-- VERIFICAÇÃO: Execute para confirmar políticas
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN (
  'estabelecimentos',
  'agendamento_online_config',
  'servicos',
  'usuarios',
  'clientes',
  'agendamentos'
)
ORDER BY tablename, policyname;
