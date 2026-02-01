-- Script para corrigir duracao_total dos pacotes existentes
-- Execute este SQL no Supabase SQL Editor

-- IMPORTANTE: Este script é uma correção temporária
-- O problema real deve ser corrigido no aplicativo mobile BusinessApp
-- onde os pacotes são criados sem gravar a duracao_total

-- Exemplo: Atualizar o pacote "Axila+Pernas" com duração correta
-- Se ele tem serviços de 40min + 5min = 45min total
UPDATE public.pacotes
SET duracao_total = 45
WHERE id = '17aba15e-af30-46cc-92af-4b438cd2ba72'
  AND duracao_total IS NULL;

-- Para verificar todos os pacotes com duração null:
SELECT 
  id,
  nome,
  descricao,
  duracao_total,
  valor,
  estabelecimento_id
FROM public.pacotes
WHERE duracao_total IS NULL;

-- INSTRUÇÕES:
-- 1. Execute o SELECT acima para ver quais pacotes precisam de correção
-- 2. Para cada pacote, verifique no app mobile quais serviços ele contém
-- 3. Some as durações dos serviços
-- 4. Execute UPDATE para cada pacote com a duração correta

-- Exemplo de UPDATE genérico:
-- UPDATE public.pacotes
-- SET duracao_total = [SOMA_DAS_DURACOES]
-- WHERE id = '[ID_DO_PACOTE]';
