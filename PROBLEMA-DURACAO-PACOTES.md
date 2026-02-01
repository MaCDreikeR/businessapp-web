# 🐛 Problema: Pacotes sem duração total

## Descrição do Problema

Os pacotes criados no **aplicativo mobile BusinessApp** não estão gravando o campo `duracao_total` no banco de dados, resultando em valores `null`.

### Exemplo:
```sql
-- Pacote "Axila+Pernas" criado com 2 serviços (40min + 5min)
-- duracao_total deveria ser 45, mas está null
INSERT INTO "public"."pacotes" (..., "duracao_total") 
VALUES (..., null);  -- ❌ ERRADO
```

## Impacto

1. **Sistema Web de Agendamento**: Trata como 0 min, mas exibe aviso visual
2. **Cálculo de horários**: Pode gerar horários de término incorretos
3. **Experiência do cliente**: Não sabe quanto tempo durará o atendimento

## Soluções

### 1️⃣ Correção Temporária (Banco de Dados)

Execute o SQL em [corrigir-duracao-pacotes.sql](corrigir-duracao-pacotes.sql):

```sql
-- Atualizar manualmente o pacote existente
UPDATE public.pacotes
SET duracao_total = 45
WHERE id = '17aba15e-af30-46cc-92af-4b438cd2ba72';
```

### 2️⃣ Correção Definitiva (Aplicativo Mobile)

**⚠️ AÇÃO NECESSÁRIA NO BUSINESSAPP**

O bug está na tela de criar/editar pacotes do app mobile. Quando serviços são selecionados:

1. ✅ O app **calcula** a duração total corretamente (soma dos serviços)
2. ❌ O app **NÃO grava** esse valor no campo `duracao_total` ao fazer INSERT

**Localização provável do bug:**
- Arquivo: `BusinessApp/app/(app)/pacotes/criar.tsx` ou similar
- Função: `handleSave()` ou `criarPacote()`
- Problema: Falta incluir `duracao_total` no payload do INSERT

**Correção esperada:**
```typescript
// ANTES (errado)
const { data, error } = await supabase
  .from('pacotes')
  .insert({
    nome,
    descricao,
    valor,
    desconto,
    estabelecimento_id,
    // ❌ duracao_total não está sendo enviado
  });

// DEPOIS (correto)
const duracaoTotal = servicosSelecionados.reduce((sum, s) => sum + s.duracao, 0);

const { data, error } = await supabase
  .from('pacotes')
  .insert({
    nome,
    descricao,
    valor,
    desconto,
    estabelecimento_id,
    duracao_total: duracaoTotal, // ✅ Adicionar esta linha
  });
```

## Status Atual

- ✅ **Sistema Web**: Tratando `null` como 0 e exibindo aviso
- ⏳ **Aplicativo Mobile**: Aguardando correção
- ⚠️ **Banco de Dados**: 1 pacote com duração null precisa ser atualizado manualmente

## Próximos Passos

1. Execute o SQL de correção no pacote existente
2. Localize e corrija o código de criação de pacotes no app mobile
3. Teste criando um novo pacote e verifique se `duracao_total` é gravado
4. Considere adicionar validação no banco: `CHECK (duracao_total IS NOT NULL AND duracao_total > 0)`
