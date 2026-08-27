-- TERVELO Phase 11 — frequência cardíaca (Web Bluetooth).
-- Dados do atleta; append-only nas samples. Sem identificadores Bluetooth.

CREATE TABLE public.wearable_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'web_bluetooth',
  display_name text NOT NULL,
  device_type text NOT NULL DEFAULT 'heart_rate_monitor',
  last_connected_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX wearable_devices_user_id_idx ON public.wearable_devices (user_id, last_connected_at DESC);

CREATE TRIGGER wearable_devices_set_updated_at
  BEFORE UPDATE ON public.wearable_devices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.heart_rate_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  training_session_id uuid REFERENCES public.training_sessions (id) ON DELETE SET NULL,
  wearable_device_id uuid REFERENCES public.wearable_devices (id) ON DELETE SET NULL,
  started_at timestamptz,
  ended_at timestamptz,
  average_bpm integer,
  maximum_bpm integer,
  minimum_bpm integer,
  sample_count integer NOT NULL DEFAULT 0,
  sensor_coverage numeric,
  processing_version text NOT NULL DEFAULT 'hr-v1',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX heart_rate_sessions_user_id_idx ON public.heart_rate_sessions (user_id, started_at DESC);

CREATE TRIGGER heart_rate_sessions_set_updated_at
  BEFORE UPDATE ON public.heart_rate_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.heart_rate_samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  heart_rate_session_id uuid NOT NULL REFERENCES public.heart_rate_sessions (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  training_session_id uuid REFERENCES public.training_sessions (id) ON DELETE SET NULL,
  exercise_id text,
  set_id text,
  recorded_at timestamptz NOT NULL,
  bpm integer NOT NULL,
  source text NOT NULL DEFAULT 'web_bluetooth',
  is_valid boolean NOT NULL DEFAULT true,
  quality text NOT NULL DEFAULT 'good',
  quality_reason text,
  client_mutation_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, client_mutation_id)
);

CREATE INDEX heart_rate_samples_session_idx ON public.heart_rate_samples (heart_rate_session_id, recorded_at);
CREATE INDEX heart_rate_samples_user_idx ON public.heart_rate_samples (user_id, recorded_at);
