CREATE TABLE public.exercise_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_exercise_id uuid NOT NULL REFERENCES public.canonical_exercises (id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'gif' CHECK (kind IN ('gif')),
  file_id uuid,
  object_key text NOT NULL,
  mime_type text NOT NULL DEFAULT 'image/gif',
  bytes integer,
  sha256 text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (canonical_exercise_id, kind)
);

CREATE INDEX exercise_media_object_key_idx ON public.exercise_media (object_key);
