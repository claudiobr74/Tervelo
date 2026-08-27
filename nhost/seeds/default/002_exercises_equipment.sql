-- Catálogo mínimo alinhado às telas Figma da Phase 5 (aliases, não milhares de linhas).

INSERT INTO public.muscles (muscle_group_id, slug, name_pt)
SELECT id, 'latissimus', 'Latíssimo do dorso' FROM public.muscle_groups WHERE slug = 'back'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.muscles (muscle_group_id, slug, name_pt)
SELECT id, 'pectoralis_major', 'Peitoral maior' FROM public.muscle_groups WHERE slug = 'chest'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.muscles (muscle_group_id, slug, name_pt)
SELECT id, 'quadriceps', 'Quadríceps' FROM public.muscle_groups WHERE slug = 'legs'
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.muscles (muscle_group_id, slug, name_pt)
SELECT id, 'biceps', 'Bíceps' FROM public.muscle_groups WHERE slug = 'arms'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.manufacturers (name) VALUES
  ('Life Fitness'),
  ('Hammer Strength'),
  ('Technogym'),
  ('Matrix')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.equipment (category_id, name_pt, movement_pattern_id, resistance_system, starting_load_kg, increment_kg)
SELECT c.id, 'Lat Pulldown', p.id, 'Pilha de pesos', 5, 5
FROM public.equipment_categories c, public.movement_patterns p
WHERE c.slug = 'cable' AND p.slug = 'vertical_pull'
  AND NOT EXISTS (SELECT 1 FROM public.equipment e WHERE e.name_pt = 'Lat Pulldown');

INSERT INTO public.equipment (category_id, name_pt, movement_pattern_id, resistance_system, starting_load_kg, increment_kg)
SELECT c.id, 'Chest Press Convergente', p.id, 'Pilha de pesos', 5, 2.5
FROM public.equipment_categories c, public.movement_patterns p
WHERE c.slug = 'selectorized' AND p.slug = 'horizontal_push'
  AND NOT EXISTS (SELECT 1 FROM public.equipment e WHERE e.name_pt = 'Chest Press Convergente');

INSERT INTO public.canonical_exercises (name_pt, description, movement_pattern_id)
SELECT 'Puxada Alta Aberta', 'Um canônico. Fabricante fica no modelo de equipamento.', id
FROM public.movement_patterns WHERE slug = 'vertical_pull'
  AND NOT EXISTS (SELECT 1 FROM public.canonical_exercises e WHERE e.name_pt = 'Puxada Alta Aberta');

INSERT INTO public.canonical_exercises (name_pt, description, movement_pattern_id)
SELECT 'Supino Reto com Barra', 'Um canônico — bench press é alias, não outro exercício.', id
FROM public.movement_patterns WHERE slug = 'horizontal_push'
  AND NOT EXISTS (SELECT 1 FROM public.canonical_exercises e WHERE e.name_pt = 'Supino Reto com Barra');

INSERT INTO public.exercise_aliases (canonical_exercise_id, alias, locale)
SELECT id, alias, 'pt' FROM public.canonical_exercises
CROSS JOIN (VALUES ('puxada alta'), ('lat pulldown'), ('pulldown')) AS a(alias)
WHERE name_pt = 'Puxada Alta Aberta'
ON CONFLICT DO NOTHING;

INSERT INTO public.exercise_aliases (canonical_exercise_id, alias, locale)
SELECT id, alias, 'pt' FROM public.canonical_exercises
CROSS JOIN (VALUES ('supino reto'), ('bench press'), ('supino horizontal')) AS a(alias)
WHERE name_pt = 'Supino Reto com Barra'
ON CONFLICT DO NOTHING;
