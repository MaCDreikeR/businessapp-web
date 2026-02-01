-- Adicionar política RLS para leitura pública da tabela pacotes

-- Remover política existente se houver
DROP POLICY IF EXISTS "Leitura pública de pacotes" ON public.pacotes;

-- Criar nova política para permitir leitura pública (sem filtro de ativo pois a coluna não existe)
CREATE POLICY "Leitura pública de pacotes" ON public.pacotes
  FOR SELECT
  TO anon, authenticated
  USING (true);
