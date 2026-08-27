-- TERVELO Phase 12 — Estado do Atleta, check-in pré/pós-treino e revisão semanal.
-- Nomes físicos em inglês. Copy de produto permanece em português.

CREATE TABLE public.pre_workout_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  training_session_id uuid REFERENCES public.training_sessions (id) ON DELETE SET NULL,
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL CHECK (status IN ('completed', 'skipped')),
  sleep_quality smallint CHECK (sleep_quality BETWEEN 1 AND 5),
  energy smallint CHECK (energy BETWEEN 1 AND 5),
  muscle_recovery smallint CHECK (muscle_recovery BETWEEN 1 AND 4),
  stress smallint CHECK (stress BETWEEN 1 AND 4),
  has_pain boolean,
  pain_region text,
  pain_intensity text CHECK (pain_intensity IN ('leve', 'moderada', 'forte')),
  pain_worsens_with_movement boolean,
  pain_blocks_planned_exercise text CHECK (pain_blocks_planned_exercise IN ('nao', 'sim', 'nao_sei')),
  has_planned_time boolean,
  available_minutes integer CHECK (available_minutes IS NULL OR available_minutes > 0),
  client_mutation_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, client_mutation_id)
);

CREATE INDEX pre_workout_checkins_user_idx ON public.pre_workout_checkins (user_id, checked_in_at DESC);

CREATE TABLE public.post_workout_checkouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  training_session_id uuid REFERENCES public.training_sessions (id) ON DELETE SET NULL,
  checked_out_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL CHECK (status IN ('completed', 'skipped')),
  expectation text CHECK (expectation IN ('muito_abaixo', 'abaixo', 'como_esperado', 'acima', 'muito_acima')),
  difficulty text CHECK (difficulty IN ('muito_facil', 'facil', 'adequada', 'dificil', 'muito_dificil')),
  plan_completion text CHECK (plan_completion IN ('sim', 'parcialmente', 'nao')),
  partial_reasons text[] NOT NULL DEFAULT '{}',
  had_pain boolean,
  client_mutation_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, client_mutation_id)
);

CREATE INDEX post_workout_checkouts_user_idx ON public.post_workout_checkouts (user_id, checked_out_at DESC);

CREATE TABLE public.athlete_state_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  period_start timestamptz,
  period_end timestamptz,
  algorithm_version text NOT NULL DEFAULT 'athlete-state-v1',
  overall_state text NOT NULL,
  training_state text,
  training_confidence text,
  recovery_state text,
  recovery_confidence text,
  nutrition_state text,
  nutrition_confidence text,
  body_composition_state text,
  body_composition_confidence text,
  heart_rate_state text,
  heart_rate_enabled boolean NOT NULL DEFAULT false,
  heart_rate_confidence text,
  adherence_state text,
  limitations_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  alerts_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_data_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  reasons_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  data_quality text,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  client_mutation_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, client_mutation_id)
);

CREATE INDEX athlete_state_snapshots_user_idx ON public.athlete_state_snapshots (user_id, generated_at DESC);

CREATE TABLE public.weekly_coach_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  training_week_id uuid REFERENCES public.training_weeks (id) ON DELETE SET NULL,
  athlete_state_snapshot_id uuid REFERENCES public.athlete_state_snapshots (id) ON DELETE SET NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  contract_version text,
  prompt_version text,
  model text,
  agents_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  headline text NOT NULL,
  overview text NOT NULL,
  what_improved text,
  what_needs_attention text,
  training_copy text,
  nutrition_copy text,
  body_copy text,
  recovery_copy text,
  heart_rate_copy text,
  next_week_copy text,
  decision text NOT NULL,
  suggested_changes_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'viewed')),
  ai_run_id uuid,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX weekly_coach_reviews_user_idx ON public.weekly_coach_reviews (user_id, period_end DESC);

CREATE TRIGGER weekly_coach_reviews_set_updated_at
  BEFORE UPDATE ON public.weekly_coach_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.weekly_review_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  weekly_review_id uuid NOT NULL REFERENCES public.weekly_coach_reviews (id) ON DELETE CASCADE,
  decision_kind text NOT NULL,
  suggested_changes_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  accepted_changes_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  rejected_changes_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  follow_up_period_start date,
  follow_up_period_end date,
  follow_up_performance_json jsonb,
  follow_up_recovery_json jsonb,
  follow_up_adherence_json jsonb,
  follow_up_nutrition_json jsonb,
  follow_up_body_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX weekly_review_decisions_user_idx ON public.weekly_review_decisions (user_id, created_at DESC);

CREATE TRIGGER weekly_review_decisions_set_updated_at
  BEFORE UPDATE ON public.weekly_review_decisions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
