# TERVELO — Desenho do banco de dados

**SGBD:** PostgreSQL (Nhost)  
**Acesso de aplicação:** Hasura GraphQL + Functions (admin/service)  
**Princípios:** histórico append-only; catálogo global vs dados do atleta; sem `organization_id` espalhado; sem enums fechados de anilhas/exercícios.

Este documento precede a primeira migration. Schema real entra em `nhost/migrations` na Phase 2.

---

## 1. Fronteiras de tenant

| Classe | Exemplos | Dono |
| --- | --- | --- |
| Identidade | `auth.users`, `profiles` | usuário Nhost |
| Atleta | perfil, objetivos, preferências, medidas, recuperação, nutrição, sessões | `user_id` |
| Local | `gyms`, inventário | `owner_user_id` no MVP |
| Catálogo | músculos, exercícios canônicos, equipamentos canônicos | global (admin write) |
| IA operacional | contratos publicados | global |
| Auditoria / decisões IA | por usuário | `user_id` |

**MVP B2C:** o atleta é o tenant.  
**Futuro B2B:** `organizations` + `organization_members` + `gyms.organization_id` nullable. Não criar membership org agora.

Não colocar `organization_id` em `set_results`, `body_measurements` ou check-ins.

---

## 2. Convenções

- PK `uuid` `gen_random_uuid()`.
- `created_at` / `updated_at` `timestamptz` (`now()`).
- Soft-delete só onde listagens administrativas precisam (`deleted_at`); histórico de treino **não** se apaga no fluxo normal.
- Medidas e resultados: **insert only** (sem UPDATE de valores). Correção = novo registro + `supersedes_id` opcional.
- Idade **não** é coluna persistida; deriva de `birth_date`.
- Textos de catálogo em PT-BR; aliases para busca.
- Quantidades em kg e cm no SI; descanso em **segundos** (`integer`, sem preset obrigatório).

---

## 3. Diagrama lógico (núcleo)

```text
auth.users 1—1 profiles 1—1 athlete_profiles
                         ├—n athlete_goals
                         ├—n athlete_preferences
                         ├—n body_measurements
                         ├—n recovery_checkins
                         ├—n gym_memberships —n gyms
                         └—n training_programs —n blocks —n weeks —n sessions
                                                          └—n session_exercises
                                                               ├—n exercise_sets
                                                               └—n set_results
```

Catálogo:

```text
muscle_groups 1—n muscles
movement_patterns
canonical_exercises —n exercise_variants —n exercise_equipment — equipment
                 └—n exercise_aliases
manufacturers —n equipment_models —n equipment
equipment_categories
```

---

## 4. Identidade e atleta

### `profiles`

Espelho público mínimo de `auth.users`. PK = `auth.users.id`.

| Coluna | Tipo | Notas |
| --- | --- | --- |
| `id` | uuid PK | = user id |
| `display_name` | text | |
| `locale` | text | default `pt` |
| `theme_preference` | text | `light` \| `dark` \| `system` |
| `shortcuts_enabled` | boolean | default true |
| `created_at` / `updated_at` | timestamptz | |

Criado por trigger após insert em `auth.users`. Usuário atualiza só a própria linha.

### `athlete_profiles`

| Coluna | Tipo | Notas |
| --- | --- | --- |
| `id` | uuid PK | |
| `user_id` | uuid unique | → profiles |
| `birth_date` | date | idade derivada na aplicação |
| `sex` | text nullable | só quando relevante à avaliação; não obrigatório |
| `height_cm` | numeric nullable | |
| `experience_level` | text nullable | iniciante / intermediário / avançado — **não** enum rígido no PG se o vocabulário crescer; check opcional |
| `availability_json` | jsonb | dias/horários |
| `created_at` / `updated_at` | timestamptz | |

Peso e % gordura **não** vivem aqui como valor corrente único. Último valor = query em `body_measurements`.

### `athlete_goals`

Objetivos versionados (um ativo). `status`: `active` \| `completed` \| `abandoned`. Campos: tipo (hipertrofia, força, recomposição, etc.), prazo, notas. Não apagar o histórico ao trocar objetivo.

### `athlete_preferences`

Chave/valor ou colunas: unidades, ênfase muscular, equipamentos evitados, idioma de cues. Limitações de treino: tabela `athlete_limitations` (`body_region`, `constraint_text`, `severity`, `active`).

---

## 5. Medidas longitudinais

### `body_measurements`

Uma linha = um ponto no tempo. Nunca UPDATE de métricas.

| Coluna | Tipo |
| --- | --- |
| `id` | uuid |
| `user_id` | uuid |
| `measured_at` | timestamptz |
| `source` | text | `user` \| `coach` \| `device` \| `import` |
| `weight_kg` | numeric |
| `body_fat_percent` | numeric |
| `waist_cm`, `abdomen_cm`, `hip_cm`, `chest_cm` | numeric |
| `left_arm_cm`, `right_arm_cm` | numeric |
| `left_forearm_cm`, `right_forearm_cm` | numeric |
| `left_thigh_cm`, `right_thigh_cm` | numeric |
| `left_calf_cm`, `right_calf_cm` | numeric |
| `extra_json` | jsonb | medidas configuráveis |
| `notes` | text |
| `supersedes_id` | uuid nullable | correção explícita |

Índice `(user_id, measured_at desc)`.

---

## 6. Recuperação

### `recovery_checkins`

| Coluna | Tipo |
| --- | --- |
| `user_id` | uuid |
| `checked_in_at` | timestamptz |
| `sleep_quality` | smallint | escala 1–5 (documentar na UI por extenso) |
| `energy` | smallint |
| `mood` | smallint | disposição |
| `muscle_soreness` | smallint |
| `discomfort` | smallint |
| `stress` | smallint |
| `perceived_recovery` | smallint |
| `notes` | text |

IA deve agregar janelas, não um único ponto.

---

## 7. Academias e inventário

### `gyms`

| Coluna | Notas |
| --- | --- |
| `owner_user_id` | atleta que cadastrou (MVP) |
| `organization_id` | uuid nullable — **reservado**, sem FK org na Phase 2 |
| `name` | |
| `notes` | |

Um usuário pode ter várias academias.

### `gym_memberships`

`gym_id`, `user_id`, `is_primary`, `status`. Permite treinar em academia compartilhada no futuro sem redesenhar.

### `gym_equipment`

Instância no local: `gym_id`, `equipment_id` (catálogo), `equipment_model_id` nullable, `quantity`, `notes`, `is_available`.

### `gym_bars`

Barra **neste** ginásio: `gym_id`, `bar_kind` (text: olympic, powerlifting, deadlift, squat, ez, w, trap, safety_squat, cambered, buffalo, swiss, multi_grip, axle, technique, other), `actual_weight_kg` **obrigatório**, `name`, `quantity`. Não enum PG fechado — check frouxo ou lookup `bar_kinds` seedável.

### `gym_plates`

Inventário de anilhas: `gym_id`, `weight_kg` (numeric, **não enum**), `quantity`. Seeds sugeridos: 0.5, 1, 1.25, 2, 2.5, 5, 10, 15, 20, 25 — inseridos como dados, não como tipo.

### `gym_dumbbell_sets`

Dois modos (um deles preenchido):

- `weights_kg numeric[]` (2, 4, 6, …)
- ou `min_kg`, `max_kg`, `increment_kg`

A IA / calculadora recusa carga impossível se o inventário existir.

---

## 8. Catálogo de equipamentos e exercícios

### `equipment_categories`

barra, halteres, seletorizada, carregada com anilhas, cabos, Smith, kettlebell, peso corporal, elásticos, landmine, acessórios, racks, bancos, functional trainer, máquinas digitais, outros. **Tabela seedável**, não enum de produto.

### `manufacturers` / `equipment` / `equipment_models`

- `equipment`: nome canônico, categoria, padrão de movimento, sistema de resistência/carregamento, `starting_load_kg`, `independent_arms`, `increment_kg`, grupo muscular primário opcional.
- `equipment_models`: fabricante + modelo opcional. Não duplicar exercício por marca.

### `muscle_groups` / `muscles` / `movement_patterns`

Normalização clássica. Exercício canônico aponta para primário + N:N `exercise_muscles` (papel: primary/secondary/stabilizer).

### `canonical_exercises`

Nome PT-BR, descrição, padrão, flags de segurança. **Um** “Supino horizontal”.

### `exercise_variants`

Ex.: convergente, pegada neutra. FK canônico.

### `exercise_equipment`

N:N variante (ou canônico) ↔ equipment, com `preference_rank`.

### `exercise_aliases`

Busca: “bench press”, “supino reto”, etc.

Mídia: `storage.files` + `exercise_media.file_id` (não URL pública permanente).

---

## 9. Motor de treino

### `training_programs`

`user_id`, `goal_id` nullable, `title`, `status` (`draft` \| `active` \| `completed` \| `archived`), `started_on`, `source` (`user` \| `ai` \| `coach`).

Adaptação = novo bloco / semana / exercício **versionado**, não apagar o plano passado.

### `training_blocks`

Mesociclo: `program_id`, `position`, `name`, `intent` (acumulação, intensificação, deload, …), datas.

### `training_weeks`

`block_id`, `week_index`, `notes`.

### `training_sessions`

`week_id` nullable (sessão avulsa permitida), `user_id`, `gym_id` nullable, `scheduled_at`, `started_at`, `completed_at`, `status` (`planned` \| `in_progress` \| `completed` \| `skipped`).

### `session_exercises`

`session_id`, `position`, `exercise_variant_id`, `planned_equipment_id`, `rest_seconds` (obrigatório poder ter valor; default de catálogo se nulo), `method_kind`, `group_id` (uuid para super/tri/giant/circuito), `notes`.

`method_kind` text seedável: warmup, working, backoff, superset, triset, giant_set, circuit, drop_set, rest_pause, cluster, myo_reps, pause, tempo, isometric.

`method_params jsonb` para cadência, drops, clusters — evita dezenas de colunas nulas.

Substituição: `exercise_substitutions` (`session_exercise_id`, `from_variant_id`, `to_variant_id`, `reason` ex. aparelho ocupado, `created_at`). **Não** reescreve o programa.

### `exercise_sets`

Prescrição: `session_exercise_id`, `set_index`, `target_reps_min/max`, `target_weight_kg`, `target_rir`, `target_rpe` (colunas com nomes por extenso na API/UI; no banco `target_reps_in_reserve` / `target_perceived_exertion` para clareza).

### `set_results`

Resultado real, append-only.

| Coluna | Notas |
| --- | --- |
| `set_id` | FK |
| `user_id` | denormalizado para permission |
| `performed_at` | timestamp |
| `weight_kg` | |
| `reps` | |
| `duration_seconds` | |
| `rest_after_seconds` | |
| `perceived_exertion` | |
| `reps_in_reserve` | |
| `equipment_id` | o que de fato usou |
| `side` | `both` \| `left` \| `right` |
| `method_kind` | |
| `client_mutation_id` | uuid — **idempotência** offline |
| Unique | `(client_mutation_id)` where not null |

### Frequência cardíaca (Phase 11)

Opcional. Pertence ao usuário. Sem identificadores Bluetooth.

`wearable_devices`: `provider` (`web_bluetooth`), `display_name`, `device_type`, `last_connected_at`, `is_active`.

`heart_rate_sessions`: âncora da sessão (`training_session_id` nullable), agregados (`average_bpm`, `maximum_bpm`, `minimum_bpm`, `sample_count`, `sensor_coverage`), `processing_version`.

`heart_rate_samples`: append-only; `client_mutation_id` único por usuário; `exercise_id`/`set_id` em texto para correlacionar o cursor local; **não** entram em `ai_runs.input_context_snapshot`.

Preferência `heart_rate_enabled` em `athlete_preferences` (default ausente = false).

### `rest_timers`

Timer robusto (não só `setInterval`):

| Coluna | Tipo |
| --- | --- |
| `id` | uuid |
| `user_id` | uuid |
| `session_id` / `session_exercise_id` / `set_result_id` | FKs nullable |
| `started_at` | timestamptz |
| `expected_end_at` | timestamptz |
| `duration_seconds` | int |
| `paused_at` | timestamptz nullable |
| `remaining_at_pause_seconds` | int nullable |
| `status` | `running` \| `paused` \| `completed` \| `skipped` |

Restante = cálculo a partir de relógio real. Espelho local (IndexedDB) para background/throttle.

---

## 10. Nutrição

### `nutrition_profiles`

Preferências, rotina, restrições, hidratação habitual. Sem sigla na UI.

### `nutrition_targets`

`user_id`, `valid_from`, `energy_kcal`, `protein_g`, `carbohydrate_g`, `fat_g`, `fluid_ml`. Versionado no tempo.

### `nutrition_checkins`

Aderência e ingestão do dia (`checked_in_on date` unique por usuário). Não sobrescrever dias anteriores: update só do dia aberto ou insert de correção com `supersedes_id`.

---

## 11. IA

### `ai_contracts`

Identidade lógica (`slug` unique), ex. `default-athlete-coach`.

### `ai_contract_versions`

`contract_id`, `version`, `author_user_id`, `state` (`draft` \| `testing` \| `published` \| `archived`), `config jsonb` (identidade, prioridades, estilo, progressão, volume, intensidade, proximidade da falha, deload, frequência, recuperação, nutrição, autonomia, detalhe), `change_summary`.

Regras críticas (authz, não fabricar dados, isolamento) **não** entram no jsonb configurável — ficam em `ai/policies` no código.

### `ai_contract_publications`

`version_id`, `published_at`, `published_by`, `environment` (`testing` \| `production`). Rollback = nova publication apontando versão anterior.

### `ai_runs`

Orquestração: `user_id`, `contract_version_id`, `model`, `status`, `input_context_snapshot jsonb` (dados estruturados, sem CoT), `created_at`.

### `ai_decisions`

| Coluna | Notas |
| --- | --- |
| `run_id` / `user_id` | |
| `agent` | orchestrator, profiler, strength, periodization, nutrition, recovery, progress, qa |
| `action` | |
| `input_snapshot` | jsonb |
| `recommendation` | jsonb |
| `rationale` | texto curto objetivo — **não** chain-of-thought privado |
| `contract_version_id` | |
| `model` | |
| `confidence` | numeric nullable |
| `accepted` | boolean nullable |
| `overridden` | boolean |
| `override_reason` | text |

---

## 12. Sistema

### `notifications`

`user_id`, tipo, payload, `read_at`.

### `audit_logs`

Ações administrativas e correções de histórico. `actor_user_id`, `action`, `entity_type`, `entity_id`, `payload jsonb`, `created_at`. Append-only. Role `user` não lê logs de outros; `admin` lê com cuidado (sem PII desnecessária no payload).

Não criar na Phase 2: `organizations`, `coach_client_links`, `teams` — documentar como extensão.

---

## 13. Tabelas da spec vs Phase 2

| Spec | Phase 2 | Notas |
| --- | --- | --- |
| profiles | sim | |
| athlete_profiles | sim | |
| athlete_goals | sim | |
| athlete_preferences | sim | |
| body_measurements | sim | |
| recovery_checkins | sim | |
| gyms, gym_memberships | sim | |
| equipment_categories, manufacturers, equipment, equipment_models | sim | |
| gym_equipment, gym_bars, gym_plates, gym_dumbbell_sets | sim | nomes alinhados à spec (`bars`/`plates`/`dumbbell_sets` como tabelas de ginásio) |
| muscle_groups, muscles, movement_patterns | sim | |
| canonical_exercises, exercise_variants, exercise_equipment, exercise_aliases | sim | |
| training_* / session_exercises / exercise_sets / set_results | sim | |
| wearable_devices / heart_rate_sessions / heart_rate_samples | sim | Phase 11; samples append-only |
| exercise_substitutions | sim | |
| rest_timers | sim | extra necessário |
| nutrition_* | sim | |
| ai_contracts / versions / publications / runs / decisions | sim | |
| notifications, audit_logs | sim | |
| organizations | **não** | D-010 |
| catálogo completo de milhares de exercícios | seed incremental | não bloquear schema |

---

## 14. Permissões (intenção)

Detalhe Hasura em `NHOST_ARCHITECTURE.md`.

- `user`: CRUD das próprias linhas (`user_id` / `owner_user_id` = `X-Hasura-User-Id`). Select no catálogo. Insert resultados com `user_id` forçado.
- `user` **não** update `set_results` métricas; correção via novo insert.
- `admin`: catálogo + leitura operacional; sem bypass irrestrito de dados de atletas salvo política explícita.
- `super_admin`: auditoria, contratos IA, publicação.
- `public`: nenhum dado de atleta.

Storage: ver buckets; progress-media e documents só dono.

---

## 15. Extensões PostgreSQL

Usar o que o Nhost já oferece (`pgcrypto` / `gen_random_uuid`). Evitar extensões exóticas. Busca de exercícios: `pg_trgm` se disponível no plano; senão ILIKE + aliases na Phase 5.

---

## 16. O que não fazer

- Enum SQL de cargas de anilha.
- Uma ficha diária que substitui o programa.
- Peso “atual” sobrescrito no perfil.
- Guardar idade.
- Confiar em `organization_id` em todas as tabelas.
- Expor `ai_decisions` de um usuário a outro.
