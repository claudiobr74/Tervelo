-- TERVELO Phase 2 — núcleo: identidade, atleta, catálogo, ginásio, treino, nutrição, IA, auditoria.
-- Histórico longitudinal é append-only. Sem organization_id espalhado.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Papéis de produto. `user` e `me` já existem no Auth Nhost.
-- Admin nunca nasce no signup: o operador promove via auth.user_roles.
INSERT INTO auth.roles (role)
VALUES ('admin'), ('super_admin')
ON CONFLICT (role) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Identidade
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  locale text NOT NULL DEFAULT 'pt',
  theme_preference text NOT NULL DEFAULT 'dark'
    CHECK (theme_preference IN ('light', 'dark', 'system')),
  shortcuts_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.athlete_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles (id) ON DELETE CASCADE,
  birth_date date,
  sex text,
  height_cm numeric,
  experience_level text,
  availability_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER athlete_profiles_set_updated_at
  BEFORE UPDATE ON public.athlete_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.athlete_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  goal_type text NOT NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'abandoned')),
  deadline date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX athlete_goals_user_id_idx ON public.athlete_goals (user_id, created_at DESC);

CREATE TRIGGER athlete_goals_set_updated_at
  BEFORE UPDATE ON public.athlete_goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.athlete_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  preference_key text NOT NULL,
  preference_value text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, preference_key)
);

CREATE TRIGGER athlete_preferences_set_updated_at
  BEFORE UPDATE ON public.athlete_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.athlete_limitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  body_region text NOT NULL,
  constraint_text text NOT NULL,
  severity text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER athlete_limitations_set_updated_at
  BEFORE UPDATE ON public.athlete_limitations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, locale, theme_preference)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.display_name, ''), split_part(COALESCE(NEW.email, 'atleta'), '@', 1)),
    COALESCE(NULLIF(NEW.locale, ''), 'pt'),
    'dark'
  );
  INSERT INTO public.athlete_profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Medidas e recuperação (append-only de métricas)
-- ---------------------------------------------------------------------------

CREATE TABLE public.body_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  measured_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'user',
  weight_kg numeric,
  body_fat_percent numeric,
  waist_cm numeric,
  abdomen_cm numeric,
  hip_cm numeric,
  chest_cm numeric,
  left_arm_cm numeric,
  right_arm_cm numeric,
  left_forearm_cm numeric,
  right_forearm_cm numeric,
  left_thigh_cm numeric,
  right_thigh_cm numeric,
  left_calf_cm numeric,
  right_calf_cm numeric,
  extra_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  supersedes_id uuid REFERENCES public.body_measurements (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX body_measurements_user_measured_idx
  ON public.body_measurements (user_id, measured_at DESC);

CREATE TABLE public.recovery_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  sleep_quality smallint CHECK (sleep_quality BETWEEN 1 AND 5),
  energy smallint CHECK (energy BETWEEN 1 AND 5),
  mood smallint CHECK (mood BETWEEN 1 AND 5),
  muscle_soreness smallint CHECK (muscle_soreness BETWEEN 1 AND 5),
  discomfort smallint CHECK (discomfort BETWEEN 1 AND 5),
  stress smallint CHECK (stress BETWEEN 1 AND 5),
  perceived_recovery smallint CHECK (perceived_recovery BETWEEN 1 AND 5),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX recovery_checkins_user_idx
  ON public.recovery_checkins (user_id, checked_in_at DESC);

-- ---------------------------------------------------------------------------
-- Catálogo (write admin)
-- ---------------------------------------------------------------------------

CREATE TABLE public.equipment_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_pt text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.bar_kinds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_pt text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.manufacturers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.muscle_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_pt text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.muscles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  muscle_group_id uuid NOT NULL REFERENCES public.muscle_groups (id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name_pt text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.movement_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_pt text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.equipment_categories (id),
  name_pt text NOT NULL,
  movement_pattern_id uuid REFERENCES public.movement_patterns (id),
  resistance_system text,
  starting_load_kg numeric,
  independent_arms boolean NOT NULL DEFAULT false,
  increment_kg numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER equipment_set_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.equipment_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.equipment (id) ON DELETE CASCADE,
  manufacturer_id uuid REFERENCES public.manufacturers (id),
  model_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.canonical_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_pt text NOT NULL,
  description text,
  movement_pattern_id uuid REFERENCES public.movement_patterns (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER canonical_exercises_set_updated_at
  BEFORE UPDATE ON public.canonical_exercises
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.exercise_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_exercise_id uuid NOT NULL REFERENCES public.canonical_exercises (id) ON DELETE CASCADE,
  name_pt text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.exercise_muscles (
  exercise_id uuid NOT NULL REFERENCES public.canonical_exercises (id) ON DELETE CASCADE,
  muscle_id uuid NOT NULL REFERENCES public.muscles (id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'primary'
    CHECK (role IN ('primary', 'secondary', 'stabilizer')),
  PRIMARY KEY (exercise_id, muscle_id, role)
);

CREATE TABLE public.exercise_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_variant_id uuid NOT NULL REFERENCES public.exercise_variants (id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES public.equipment (id) ON DELETE CASCADE,
  preference_rank smallint NOT NULL DEFAULT 1,
  UNIQUE (exercise_variant_id, equipment_id)
);

CREATE TABLE public.exercise_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_exercise_id uuid NOT NULL REFERENCES public.canonical_exercises (id) ON DELETE CASCADE,
  alias text NOT NULL,
  locale text NOT NULL DEFAULT 'pt',
  UNIQUE (canonical_exercise_id, alias, locale)
);

-- ---------------------------------------------------------------------------
-- Ginásio e inventário
-- ---------------------------------------------------------------------------

CREATE TABLE public.gyms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  organization_id uuid,
  name text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER gyms_set_updated_at
  BEFORE UPDATE ON public.gyms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.gym_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (gym_id, user_id)
);

CREATE TABLE public.gym_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms (id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES public.equipment (id),
  equipment_model_id uuid REFERENCES public.equipment_models (id),
  quantity integer NOT NULL DEFAULT 1,
  notes text,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.gym_bars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms (id) ON DELETE CASCADE,
  bar_kind text NOT NULL,
  actual_weight_kg numeric NOT NULL,
  name text,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.gym_plates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms (id) ON DELETE CASCADE,
  weight_kg numeric NOT NULL,
  quantity integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (gym_id, weight_kg)
);

CREATE TABLE public.gym_dumbbell_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms (id) ON DELETE CASCADE,
  weights_kg numeric[],
  min_kg numeric,
  max_kg numeric,
  increment_kg numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    weights_kg IS NOT NULL
    OR (min_kg IS NOT NULL AND max_kg IS NOT NULL AND increment_kg IS NOT NULL)
  )
);

-- ---------------------------------------------------------------------------
-- Motor de treino
-- ---------------------------------------------------------------------------

CREATE TABLE public.training_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  goal_id uuid REFERENCES public.athlete_goals (id),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  started_on date,
  source text NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER training_programs_set_updated_at
  BEFORE UPDATE ON public.training_programs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.training_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.training_programs (id) ON DELETE CASCADE,
  position integer NOT NULL,
  name text,
  intent text,
  starts_on date,
  ends_on date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.training_weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid NOT NULL REFERENCES public.training_blocks (id) ON DELETE CASCADE,
  week_index integer NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid REFERENCES public.training_weeks (id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  gym_id uuid REFERENCES public.gyms (id),
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX training_sessions_user_idx ON public.training_sessions (user_id, scheduled_at DESC);

CREATE TRIGGER training_sessions_set_updated_at
  BEFORE UPDATE ON public.training_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.session_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.training_sessions (id) ON DELETE CASCADE,
  position integer NOT NULL,
  exercise_variant_id uuid REFERENCES public.exercise_variants (id),
  planned_equipment_id uuid REFERENCES public.equipment (id),
  rest_seconds integer,
  method_kind text,
  method_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  group_id uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.exercise_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_exercise_id uuid NOT NULL REFERENCES public.session_exercises (id) ON DELETE CASCADE,
  set_index integer NOT NULL,
  target_reps_min integer,
  target_reps_max integer,
  target_weight_kg numeric,
  target_reps_in_reserve numeric,
  target_perceived_exertion numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.set_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id uuid NOT NULL REFERENCES public.exercise_sets (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  performed_at timestamptz NOT NULL DEFAULT now(),
  weight_kg numeric,
  reps integer,
  duration_seconds integer,
  rest_after_seconds integer,
  perceived_exertion numeric,
  reps_in_reserve numeric,
  equipment_id uuid REFERENCES public.equipment (id),
  side text NOT NULL DEFAULT 'both' CHECK (side IN ('both', 'left', 'right')),
  method_kind text,
  client_mutation_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX set_results_client_mutation_id_idx
  ON public.set_results (client_mutation_id)
  WHERE client_mutation_id IS NOT NULL;

CREATE TABLE public.exercise_substitutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_exercise_id uuid NOT NULL REFERENCES public.session_exercises (id) ON DELETE CASCADE,
  from_variant_id uuid REFERENCES public.exercise_variants (id),
  to_variant_id uuid REFERENCES public.exercise_variants (id),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.rest_timers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.training_sessions (id) ON DELETE SET NULL,
  session_exercise_id uuid REFERENCES public.session_exercises (id) ON DELETE SET NULL,
  set_result_id uuid REFERENCES public.set_results (id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL,
  expected_end_at timestamptz NOT NULL,
  duration_seconds integer NOT NULL,
  paused_at timestamptz,
  remaining_at_pause_seconds integer,
  status text NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'paused', 'completed', 'skipped')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER rest_timers_set_updated_at
  BEFORE UPDATE ON public.rest_timers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Nutrição
-- ---------------------------------------------------------------------------

CREATE TABLE public.nutrition_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles (id) ON DELETE CASCADE,
  routine text,
  restrictions text,
  hydration_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER nutrition_profiles_set_updated_at
  BEFORE UPDATE ON public.nutrition_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.nutrition_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  valid_from date NOT NULL,
  energy_kcal numeric,
  protein_g numeric,
  carbohydrate_g numeric,
  fat_g numeric,
  fluid_ml numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX nutrition_targets_user_idx ON public.nutrition_targets (user_id, valid_from DESC);

CREATE TABLE public.nutrition_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  checked_in_on date NOT NULL,
  energy_kcal numeric,
  protein_g numeric,
  carbohydrate_g numeric,
  fat_g numeric,
  fluid_ml numeric,
  adherence text,
  notes text,
  supersedes_id uuid REFERENCES public.nutrition_checkins (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, checked_in_on)
);

-- ---------------------------------------------------------------------------
-- IA e sistema
-- ---------------------------------------------------------------------------

CREATE TABLE public.ai_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_contract_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.ai_contracts (id) ON DELETE CASCADE,
  version integer NOT NULL,
  author_user_id uuid REFERENCES public.profiles (id),
  state text NOT NULL DEFAULT 'draft'
    CHECK (state IN ('draft', 'testing', 'published', 'archived')),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  change_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contract_id, version)
);

CREATE TABLE public.ai_contract_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES public.ai_contract_versions (id) ON DELETE CASCADE,
  published_at timestamptz NOT NULL DEFAULT now(),
  published_by uuid REFERENCES public.profiles (id),
  environment text NOT NULL CHECK (environment IN ('testing', 'production'))
);

CREATE TABLE public.ai_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  contract_version_id uuid REFERENCES public.ai_contract_versions (id),
  model text,
  status text NOT NULL DEFAULT 'pending',
  input_context_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.ai_runs (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  agent text NOT NULL,
  action text,
  input_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommendation jsonb NOT NULL DEFAULT '{}'::jsonb,
  rationale text,
  contract_version_id uuid REFERENCES public.ai_contract_versions (id),
  model text,
  confidence numeric,
  accepted boolean,
  overridden boolean NOT NULL DEFAULT false,
  override_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_rate_limits (
  user_id uuid PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_idx ON public.notifications (user_id, created_at DESC);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES public.profiles (id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_created_idx ON public.audit_logs (created_at DESC);

-- Storage buckets (schema storage já existe no Nhost)
INSERT INTO storage.buckets (id, download_expiration, min_upload_file_size, max_upload_file_size, cache_control, presigned_urls_enabled)
VALUES
  ('avatars', 30, 1, 5242880, 'max-age=3600', true),
  ('exercise-media', 30, 1, 20971520, 'max-age=3600', true),
  ('equipment-media', 30, 1, 20971520, 'max-age=3600', true),
  ('progress-media', 30, 1, 20971520, 'no-store', true),
  ('documents', 30, 1, 20971520, 'no-store', true)
ON CONFLICT (id) DO NOTHING;
