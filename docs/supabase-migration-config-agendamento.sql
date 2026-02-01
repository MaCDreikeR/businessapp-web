-- ============================================
-- MIGRATION: Tabela de Configuração de Agendamento Online (SIMPLIFICADA)
-- ============================================
-- Execute este script ANTES do supabase-fix-rls.sql
-- ============================================

-- Criar tabela de configuração
CREATE TABLE IF NOT EXISTS public.agendamento_online_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  
  -- Apenas liga/desliga - se ativo, tudo está liberado
  ativo BOOLEAN NOT NULL DEFAULT true,
  
  -- Mensagens personalizadas (opcional)
  mensagem_boas_vindas TEXT,
  mensagem_pos_agendamento TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraint: apenas uma config por estabelecimento
  CONSTRAINT unique_estabelecimento_config UNIQUE (estabelecimento_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_agendamento_config_estabelecimento 
  ON public.agendamento_online_config(estabelecimento_id);

CREATE INDEX IF NOT EXISTS idx_agendamento_config_ativo 
  ON public.agendamento_online_config(ativo);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_agendamento_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_agendamento_config_updated_at
  BEFORE UPDATE ON public.agendamento_online_config
  FOR EACH ROW
  EXECUTE FUNCTION update_agendamento_config_updated_at();

-- RLS Policies
ALTER TABLE public.agendamento_online_config ENABLE ROW LEVEL SECURITY;

-- Leitura pública para agendamento online (apenas configs ativas)
CREATE POLICY "Leitura pública de config agendamento ativa"
ON public.agendamento_online_config
FOR SELECT
TO anon, authenticated
USING (ativo = true);

-- Super admin pode tudo
CREATE POLICY "Super admin acesso total config agendamento"
ON public.agendamento_online_config
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Estabelecimento pode ver e editar sua própria config
CREATE POLICY "Estabelecimento pode gerenciar sua config"
ON public.agendamento_online_config
FOR ALL
TO authenticated
USING (
  estabelecimento_id IN (
    SELECT estabelecimento_id 
    FROM public.usuarios 
    WHERE id = auth.uid()
  )
)
WITH CHECK (
  estabelecimento_id IN (
    SELECT estabelecimento_id 
    FROM public.usuarios 
    WHERE id = auth.uid()
  )
);

-- ============================================
-- INSERIR CONFIGURAÇÕES PADRÃO para estabelecimentos existentes
-- ============================================
INSERT INTO public.agendamento_online_config (
  estabelecimento_id,
  ativo,
  mensagem_boas_vindas,
  mensagem_pos_agendamento
)
SELECT 
  id,
  true,
  'Bem-vindo ao ' || nome || '! Escolha o serviço e horário desejado.',
  'Agendamento realizado com sucesso! Você receberá uma confirmação em breve.'
FROM public.estabelecimentos
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.agendamento_online_config 
  WHERE estabelecimento_id = estabelecimentos.id
);

-- ============================================
-- VERIFICAÇÃO
-- ============================================
SELECT 
  e.nome as estabelecimento,
  c.ativo,
  c.mensagem_boas_vindas,
  c.created_at
FROM public.agendamento_online_config c
JOIN public.estabelecimentos e ON e.id = c.estabelecimento_id
ORDER BY e.nome;
