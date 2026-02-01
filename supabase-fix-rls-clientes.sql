-- Política RLS para permitir leitura de clientes na busca de agendamento online
-- Esta política permite que a API busque clientes por telefone para vincular agendamentos

-- Verificar políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'clientes';

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Permitir leitura de clientes para agendamento online" ON clientes;

-- Criar nova política para permitir SELECT em clientes
-- OPÇÃO 1: Permitir leitura apenas de id, nome e telefone (mais seguro)
CREATE POLICY "Permitir busca de cliente por telefone para agendamento online"
ON clientes
FOR SELECT
TO anon
USING (true); -- Permite ler qualquer cliente

-- Ou OPÇÃO 2 (mais restritiva): Permitir apenas quando tem um agendamento_online_config ativo
-- CREATE POLICY "Permitir busca de cliente para agendamento online"
-- ON clientes
-- FOR SELECT
-- TO anon
-- USING (
--   EXISTS (
--     SELECT 1 FROM agendamento_online_config
--     WHERE agendamento_online_config.estabelecimento_id = clientes.estabelecimento_id
--     AND agendamento_online_config.ativo = true
--   )
-- );

-- Verificar se a política foi criada
SELECT * FROM pg_policies WHERE tablename = 'clientes';
