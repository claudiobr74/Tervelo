INSERT INTO public.equipment_categories (slug, name_pt) VALUES
  ('bar', 'Barra'),
  ('dumbbell', 'Halteres'),
  ('selectorized', 'Seletorizada'),
  ('plate_loaded', 'Carregada com anilhas'),
  ('cable', 'Cabos'),
  ('smith', 'Smith'),
  ('kettlebell', 'Kettlebell'),
  ('bodyweight', 'Peso corporal'),
  ('band', 'Elásticos'),
  ('landmine', 'Landmine'),
  ('accessory', 'Acessórios'),
  ('rack', 'Racks'),
  ('bench', 'Bancos'),
  ('functional_trainer', 'Functional trainer'),
  ('digital', 'Máquinas digitais'),
  ('other', 'Outros')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.bar_kinds (slug, name_pt) VALUES
  ('olympic', 'Olímpica'),
  ('powerlifting', 'Powerlifting'),
  ('deadlift', 'Levantamento terra'),
  ('squat', 'Agachamento'),
  ('ez', 'EZ'),
  ('w', 'W'),
  ('trap', 'Trap'),
  ('safety_squat', 'Safety squat'),
  ('cambered', 'Cambered'),
  ('buffalo', 'Buffalo'),
  ('swiss', 'Swiss'),
  ('multi_grip', 'Multi grip'),
  ('axle', 'Axle'),
  ('technique', 'Técnica'),
  ('other', 'Outra')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.muscle_groups (slug, name_pt) VALUES
  ('chest', 'Peito'),
  ('back', 'Costas'),
  ('shoulders', 'Ombros'),
  ('arms', 'Braços'),
  ('legs', 'Pernas'),
  ('core', 'Core'),
  ('glutes', 'Glúteos'),
  ('calves', 'Panturrilhas'),
  ('neck', 'Pescoço'),
  ('full_body', 'Corpo inteiro')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.movement_patterns (slug, name_pt) VALUES
  ('horizontal_push', 'Empurrar horizontal'),
  ('vertical_push', 'Empurrar vertical'),
  ('horizontal_pull', 'Puxar horizontal'),
  ('vertical_pull', 'Puxar vertical'),
  ('squat', 'Agachar'),
  ('hinge', 'Dobrar o quadril'),
  ('lunge', 'Avanço'),
  ('carry', 'Carregar'),
  ('rotation', 'Rotação'),
  ('isolation', 'Isolamento')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.ai_contracts (slug) VALUES ('default-athlete-coach')
ON CONFLICT (slug) DO NOTHING;
