-- Correlaciona a sessão de treino criada offline com a linha do banco.
-- Sem esta coluna a fila de sincronização não tinha como confirmar a operação
-- e ficava repetindo o envio indefinidamente.
ALTER TABLE public.training_sessions
  ADD COLUMN IF NOT EXISTS client_mutation_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS training_sessions_client_mutation_id_idx
  ON public.training_sessions (client_mutation_id)
  WHERE client_mutation_id IS NOT NULL;
