export const USER_ID_EQ = { _eq: "X-Hasura-User-Id" } as const;

export const OWN = { user_id: USER_ID_EQ };
export const OWN_PROFILE = { id: USER_ID_EQ };
export const OWN_OWNER = { owner_user_id: USER_ID_EQ };
export const GYM_OWNER = { gym: { owner_user_id: USER_ID_EQ } };
export const PROGRAM_OWNER = { program: { user_id: USER_ID_EQ } };
export const SESSION_OWNER = { session: { user_id: USER_ID_EQ } };
export const SESSION_EXERCISE_OWNER = {
  session_exercise: { session: { user_id: USER_ID_EQ } },
};
export const OPEN = {};
export const PUBLISHED = { state: { _eq: "published" } };

export const SET_USER = { user_id: "x-hasura-user-id" };
export const SET_OWNER = { owner_user_id: "x-hasura-user-id" };

export const AUTH_STORAGE_INCLUDES = [
  "!include auth_provider_requests.yaml",
  "!include auth_providers.yaml",
  "!include auth_refresh_tokens.yaml",
  "!include auth_roles.yaml",
  "!include auth_user_providers.yaml",
  "!include auth_user_roles.yaml",
  "!include auth_user_security_keys.yaml",
  "!include auth_users.yaml",
  "!include storage_buckets.yaml",
  "!include storage_files.yaml",
] as const;

export const APP_ROLES = ["user", "admin", "super_admin"] as const;
export type AppRoleName = (typeof APP_ROLES)[number];

export type Filter = Record<string, unknown>;

export type OperationSpec = {
  filter: Filter;
  columns?: string[];
  set?: Record<string, string>;
  limit?: number;
};

export type TablePermission = {
  role: AppRoleName;
  operations: {
    insert?: OperationSpec;
    select?: OperationSpec;
    update?: OperationSpec;
    delete?: OperationSpec;
  };
};

export type PublicTable = {
  name: string;
  kind: "athlete" | "catalog" | "gym" | "training" | "system";
  columns: string[];
  objectRelationships?: {
    name: string;
    column?: string;
    remote?: { column: string; table: string; schema?: string };
  }[];
  arrayRelationships?: { name: string; table: string; column: string }[];
  permissions: TablePermission[];
};

const withoutMeta = (columns: string[], extra: string[] = []) =>
  columns.filter((c) => !["id", "created_at", "updated_at", ...extra].includes(c));

function athleteOwn(
  columns: string[],
  opts: { insert?: boolean; update?: boolean | string[]; delete?: boolean; insertExtraOmit?: string[] } = {},
): TablePermission[] {
  const insertOmit = ["id", "user_id", "created_at", "updated_at", ...(opts.insertExtraOmit ?? [])];
  const userOps: TablePermission["operations"] = {
    select: { filter: OWN, columns, limit: 100 },
  };
  if (opts.insert !== false) {
    userOps.insert = {
      filter: OWN,
      set: SET_USER,
      columns: columns.filter((c) => !insertOmit.includes(c)),
    };
  }
  if (opts.update) {
    userOps.update = {
      filter: OWN,
      columns: Array.isArray(opts.update)
        ? opts.update
        : withoutMeta(columns, ["user_id"]),
    };
  }
  if (opts.delete) {
    userOps.delete = { filter: OWN };
  }
  return [
    { role: "user", operations: userOps },
    { role: "admin", operations: { select: { filter: OPEN, columns, limit: 200 } } },
    { role: "super_admin", operations: { select: { filter: OPEN, columns, limit: 500 } } },
  ];
}

function catalog(columns: string[]): TablePermission[] {
  const mutateCols = withoutMeta(columns);
  return [
    { role: "user", operations: { select: { filter: OPEN, columns, limit: 1000 } } },
    {
      role: "admin",
      operations: {
        select: { filter: OPEN, columns, limit: 1000 },
        insert: { filter: OPEN, columns: mutateCols },
        update: { filter: OPEN, columns: mutateCols },
        delete: { filter: OPEN },
      },
    },
    {
      role: "super_admin",
      operations: {
        select: { filter: OPEN, columns, limit: 1000 },
        insert: { filter: OPEN, columns: mutateCols },
        update: { filter: OPEN, columns: mutateCols },
        delete: { filter: OPEN },
      },
    },
  ];
}

function gymOwned(columns: string[], insertOmit: string[] = []): TablePermission[] {
  const insertCols = columns.filter(
    (c) => !["id", "created_at", "updated_at", ...insertOmit].includes(c),
  );
  return [
    {
      role: "user",
      operations: {
        select: { filter: GYM_OWNER, columns, limit: 200 },
        insert: { filter: GYM_OWNER, columns: insertCols },
        update: { filter: GYM_OWNER, columns: insertCols },
        delete: { filter: GYM_OWNER },
      },
    },
    { role: "admin", operations: { select: { filter: OPEN, columns, limit: 200 } } },
    { role: "super_admin", operations: { select: { filter: OPEN, columns, limit: 500 } } },
  ];
}

export const PUBLIC_TABLES: PublicTable[] = [
  {
    name: "profiles",
    kind: "athlete",
    columns: [
      "id",
      "display_name",
      "locale",
      "theme_preference",
      "shortcuts_enabled",
      "created_at",
      "updated_at",
    ],
    objectRelationships: [
      { name: "user", column: "id" },
      { name: "athlete_profile", remote: { column: "user_id", table: "athlete_profiles" } },
    ],
    permissions: [
      {
        role: "user",
        operations: {
          select: { filter: OWN_PROFILE, columns: [
            "id", "display_name", "locale", "theme_preference", "shortcuts_enabled", "created_at", "updated_at",
          ], limit: 1 },
          update: {
            filter: OWN_PROFILE,
            columns: ["display_name", "locale", "theme_preference", "shortcuts_enabled"],
          },
        },
      },
      {
        role: "admin",
        operations: {
          select: { filter: OPEN, columns: [
            "id", "display_name", "locale", "theme_preference", "shortcuts_enabled", "created_at", "updated_at",
          ], limit: 200 },
        },
      },
      {
        role: "super_admin",
        operations: {
          select: { filter: OPEN, columns: [
            "id", "display_name", "locale", "theme_preference", "shortcuts_enabled", "created_at", "updated_at",
          ], limit: 500 },
        },
      },
    ],
  },
  {
    name: "athlete_profiles",
    kind: "athlete",
    columns: [
      "id", "user_id", "birth_date", "sex", "height_cm", "experience_level",
      "availability_json", "created_at", "updated_at",
    ],
    objectRelationships: [{ name: "profile", column: "user_id" }],
    permissions: athleteOwn(
      ["id", "user_id", "birth_date", "sex", "height_cm", "experience_level", "availability_json", "created_at", "updated_at"],
      { insert: false, update: true },
    ),
  },
  {
    name: "athlete_goals",
    kind: "athlete",
    columns: ["id", "user_id", "goal_type", "status", "deadline", "notes", "created_at", "updated_at"],
    permissions: athleteOwn(
      ["id", "user_id", "goal_type", "status", "deadline", "notes", "created_at", "updated_at"],
      { insert: true, update: true, delete: false },
    ),
  },
  {
    name: "athlete_preferences",
    kind: "athlete",
    columns: ["id", "user_id", "preference_key", "preference_value", "created_at", "updated_at"],
    permissions: athleteOwn(
      ["id", "user_id", "preference_key", "preference_value", "created_at", "updated_at"],
      { insert: true, update: ["preference_value"], delete: true },
    ),
  },
  {
    name: "athlete_limitations",
    kind: "athlete",
    columns: [
      "id", "user_id", "body_region", "constraint_text", "severity", "active", "created_at", "updated_at",
    ],
    permissions: athleteOwn(
      ["id", "user_id", "body_region", "constraint_text", "severity", "active", "created_at", "updated_at"],
      { insert: true, update: true, delete: false },
    ),
  },
  {
    name: "body_measurements",
    kind: "athlete",
    columns: [
      "id", "user_id", "measured_at", "source", "weight_kg", "body_fat_percent",
      "waist_cm", "abdomen_cm", "hip_cm", "chest_cm", "left_arm_cm", "right_arm_cm",
      "left_forearm_cm", "right_forearm_cm", "left_thigh_cm", "right_thigh_cm",
      "left_calf_cm", "right_calf_cm", "extra_json", "notes", "supersedes_id", "created_at",
    ],
    permissions: athleteOwn(
      [
        "id", "user_id", "measured_at", "source", "weight_kg", "body_fat_percent",
        "waist_cm", "abdomen_cm", "hip_cm", "chest_cm", "left_arm_cm", "right_arm_cm",
        "left_forearm_cm", "right_forearm_cm", "left_thigh_cm", "right_thigh_cm",
        "left_calf_cm", "right_calf_cm", "extra_json", "notes", "supersedes_id", "created_at",
      ],
      { insert: true, update: false, delete: false, insertExtraOmit: [] },
    ),
  },
  {
    name: "recovery_checkins",
    kind: "athlete",
    columns: [
      "id", "user_id", "checked_in_at", "sleep_quality", "energy", "mood",
      "muscle_soreness", "discomfort", "stress", "perceived_recovery", "notes", "created_at",
    ],
    permissions: athleteOwn(
      [
        "id", "user_id", "checked_in_at", "sleep_quality", "energy", "mood",
        "muscle_soreness", "discomfort", "stress", "perceived_recovery", "notes", "created_at",
      ],
      { insert: true, update: false, delete: false },
    ),
  },
  {
    name: "equipment_categories",
    kind: "catalog",
    columns: ["id", "slug", "name_pt", "created_at"],
    permissions: catalog(["id", "slug", "name_pt", "created_at"]),
  },
  {
    name: "bar_kinds",
    kind: "catalog",
    columns: ["id", "slug", "name_pt", "created_at"],
    permissions: catalog(["id", "slug", "name_pt", "created_at"]),
  },
  {
    name: "manufacturers",
    kind: "catalog",
    columns: ["id", "name", "created_at"],
    permissions: catalog(["id", "name", "created_at"]),
  },
  {
    name: "muscle_groups",
    kind: "catalog",
    columns: ["id", "slug", "name_pt", "created_at"],
    permissions: catalog(["id", "slug", "name_pt", "created_at"]),
  },
  {
    name: "muscles",
    kind: "catalog",
    columns: ["id", "muscle_group_id", "slug", "name_pt", "created_at"],
    objectRelationships: [{ name: "muscle_group", column: "muscle_group_id" }],
    permissions: catalog(["id", "muscle_group_id", "slug", "name_pt", "created_at"]),
  },
  {
    name: "movement_patterns",
    kind: "catalog",
    columns: ["id", "slug", "name_pt", "created_at"],
    permissions: catalog(["id", "slug", "name_pt", "created_at"]),
  },
  {
    name: "equipment",
    kind: "catalog",
    columns: [
      "id", "category_id", "name_pt", "movement_pattern_id", "resistance_system",
      "starting_load_kg", "independent_arms", "increment_kg", "created_at", "updated_at",
    ],
    permissions: catalog([
      "id", "category_id", "name_pt", "movement_pattern_id", "resistance_system",
      "starting_load_kg", "independent_arms", "increment_kg", "created_at", "updated_at",
    ]),
  },
  {
    name: "equipment_models",
    kind: "catalog",
    columns: ["id", "equipment_id", "manufacturer_id", "model_name", "created_at"],
    permissions: catalog(["id", "equipment_id", "manufacturer_id", "model_name", "created_at"]),
  },
  {
    name: "canonical_exercises",
    kind: "catalog",
    columns: ["id", "name_pt", "description", "movement_pattern_id", "created_at", "updated_at"],
    permissions: catalog(["id", "name_pt", "description", "movement_pattern_id", "created_at", "updated_at"]),
  },
  {
    name: "exercise_variants",
    kind: "catalog",
    columns: ["id", "canonical_exercise_id", "name_pt", "created_at"],
    objectRelationships: [{ name: "canonical_exercise", column: "canonical_exercise_id" }],
    permissions: catalog(["id", "canonical_exercise_id", "name_pt", "created_at"]),
  },
  {
    name: "exercise_muscles",
    kind: "catalog",
    columns: ["exercise_id", "muscle_id", "role"],
    permissions: catalog(["exercise_id", "muscle_id", "role"]),
  },
  {
    name: "exercise_equipment",
    kind: "catalog",
    columns: ["id", "exercise_variant_id", "equipment_id", "preference_rank"],
    permissions: catalog(["id", "exercise_variant_id", "equipment_id", "preference_rank"]),
  },
  {
    name: "exercise_aliases",
    kind: "catalog",
    columns: ["id", "canonical_exercise_id", "alias", "locale"],
    permissions: catalog(["id", "canonical_exercise_id", "alias", "locale"]),
  },
  {
    name: "gyms",
    kind: "gym",
    columns: ["id", "owner_user_id", "organization_id", "name", "notes", "created_at", "updated_at"],
    arrayRelationships: [
      { name: "memberships", table: "gym_memberships", column: "gym_id" },
      { name: "bars", table: "gym_bars", column: "gym_id" },
      { name: "plates", table: "gym_plates", column: "gym_id" },
    ],
    permissions: [
      {
        role: "user",
        operations: {
          select: { filter: OWN_OWNER, columns: ["id", "owner_user_id", "organization_id", "name", "notes", "created_at", "updated_at"], limit: 50 },
          insert: {
            filter: OWN_OWNER,
            set: SET_OWNER,
            columns: ["name", "notes"],
          },
          update: { filter: OWN_OWNER, columns: ["name", "notes"] },
          delete: { filter: OWN_OWNER },
        },
      },
      {
        role: "admin",
        operations: {
          select: { filter: OPEN, columns: ["id", "owner_user_id", "organization_id", "name", "notes", "created_at", "updated_at"], limit: 200 },
        },
      },
      {
        role: "super_admin",
        operations: {
          select: { filter: OPEN, columns: ["id", "owner_user_id", "organization_id", "name", "notes", "created_at", "updated_at"], limit: 500 },
        },
      },
    ],
  },
  {
    name: "gym_memberships",
    kind: "gym",
    columns: ["id", "gym_id", "user_id", "is_primary", "status", "created_at"],
    objectRelationships: [{ name: "gym", column: "gym_id" }],
    permissions: [
      {
        role: "user",
        operations: {
          select: { filter: { _or: [OWN, GYM_OWNER] }, columns: ["id", "gym_id", "user_id", "is_primary", "status", "created_at"], limit: 50 },
          // Sem set.user_id: o dono cadastra memberships de outros atletas.
          insert: { filter: GYM_OWNER, columns: ["gym_id", "user_id", "is_primary", "status"] },
          update: { filter: GYM_OWNER, columns: ["is_primary", "status"] },
          delete: { filter: GYM_OWNER },
        },
      },
      { role: "admin", operations: { select: { filter: OPEN, columns: ["id", "gym_id", "user_id", "is_primary", "status", "created_at"], limit: 200 } } },
      { role: "super_admin", operations: { select: { filter: OPEN, columns: ["id", "gym_id", "user_id", "is_primary", "status", "created_at"], limit: 500 } } },
    ],
  },
  {
    name: "gym_equipment",
    kind: "gym",
    columns: [
      "id", "gym_id", "equipment_id", "equipment_model_id", "quantity", "notes", "is_available", "created_at",
    ],
    objectRelationships: [{ name: "gym", column: "gym_id" }],
    permissions: gymOwned([
      "id", "gym_id", "equipment_id", "equipment_model_id", "quantity", "notes", "is_available", "created_at",
    ]),
  },
  {
    name: "gym_bars",
    kind: "gym",
    columns: ["id", "gym_id", "bar_kind", "actual_weight_kg", "name", "quantity", "created_at"],
    objectRelationships: [{ name: "gym", column: "gym_id" }],
    permissions: gymOwned(["id", "gym_id", "bar_kind", "actual_weight_kg", "name", "quantity", "created_at"]),
  },
  {
    name: "gym_plates",
    kind: "gym",
    columns: ["id", "gym_id", "weight_kg", "quantity", "created_at"],
    objectRelationships: [{ name: "gym", column: "gym_id" }],
    permissions: gymOwned(["id", "gym_id", "weight_kg", "quantity", "created_at"]),
  },
  {
    name: "gym_dumbbell_sets",
    kind: "gym",
    columns: ["id", "gym_id", "weights_kg", "min_kg", "max_kg", "increment_kg", "created_at"],
    objectRelationships: [{ name: "gym", column: "gym_id" }],
    permissions: gymOwned(["id", "gym_id", "weights_kg", "min_kg", "max_kg", "increment_kg", "created_at"]),
  },
  {
    name: "training_programs",
    kind: "training",
    columns: ["id", "user_id", "goal_id", "title", "status", "started_on", "source", "created_at", "updated_at"],
    permissions: athleteOwn(
      ["id", "user_id", "goal_id", "title", "status", "started_on", "source", "created_at", "updated_at"],
      { insert: true, update: true, delete: false },
    ),
  },
  {
    name: "training_blocks",
    kind: "training",
    columns: ["id", "program_id", "position", "name", "intent", "starts_on", "ends_on", "created_at"],
    objectRelationships: [{ name: "program", column: "program_id" }],
    permissions: [
      {
        role: "user",
        operations: {
          select: { filter: PROGRAM_OWNER, columns: ["id", "program_id", "position", "name", "intent", "starts_on", "ends_on", "created_at"], limit: 100 },
          insert: { filter: PROGRAM_OWNER, columns: ["program_id", "position", "name", "intent", "starts_on", "ends_on"] },
          update: { filter: PROGRAM_OWNER, columns: ["position", "name", "intent", "starts_on", "ends_on"] },
        },
      },
      { role: "admin", operations: { select: { filter: OPEN, columns: ["id", "program_id", "position", "name", "intent", "starts_on", "ends_on", "created_at"], limit: 200 } } },
      { role: "super_admin", operations: { select: { filter: OPEN, columns: ["id", "program_id", "position", "name", "intent", "starts_on", "ends_on", "created_at"], limit: 500 } } },
    ],
  },
  {
    name: "training_weeks",
    kind: "training",
    columns: ["id", "block_id", "week_index", "notes", "created_at"],
    objectRelationships: [{ name: "block", column: "block_id" }],
    permissions: [
      {
        role: "user",
        operations: {
          select: {
            filter: { block: PROGRAM_OWNER },
            columns: ["id", "block_id", "week_index", "notes", "created_at"],
            limit: 100,
          },
          insert: { filter: { block: PROGRAM_OWNER }, columns: ["block_id", "week_index", "notes"] },
          update: { filter: { block: PROGRAM_OWNER }, columns: ["week_index", "notes"] },
        },
      },
      { role: "admin", operations: { select: { filter: OPEN, columns: ["id", "block_id", "week_index", "notes", "created_at"], limit: 200 } } },
      { role: "super_admin", operations: { select: { filter: OPEN, columns: ["id", "block_id", "week_index", "notes", "created_at"], limit: 500 } } },
    ],
  },
  {
    name: "training_sessions",
    kind: "training",
    columns: [
      "id", "week_id", "user_id", "gym_id", "scheduled_at", "started_at", "completed_at", "status",
      "created_at", "updated_at",
    ],
    permissions: athleteOwn(
      [
        "id", "week_id", "user_id", "gym_id", "scheduled_at", "started_at", "completed_at", "status",
        "created_at", "updated_at",
      ],
      { insert: true, update: true, delete: false },
    ),
  },
  {
    name: "session_exercises",
    kind: "training",
    columns: [
      "id", "session_id", "position", "exercise_variant_id", "planned_equipment_id",
      "rest_seconds", "method_kind", "method_params", "group_id", "notes", "created_at",
    ],
    objectRelationships: [{ name: "session", column: "session_id" }],
    permissions: [
      {
        role: "user",
        operations: {
          select: {
            filter: SESSION_OWNER,
            columns: [
              "id", "session_id", "position", "exercise_variant_id", "planned_equipment_id",
              "rest_seconds", "method_kind", "method_params", "group_id", "notes", "created_at",
            ],
            limit: 200,
          },
          insert: {
            filter: SESSION_OWNER,
            columns: [
              "session_id", "position", "exercise_variant_id", "planned_equipment_id",
              "rest_seconds", "method_kind", "method_params", "group_id", "notes",
            ],
          },
          update: {
            filter: SESSION_OWNER,
            columns: [
              "position", "exercise_variant_id", "planned_equipment_id",
              "rest_seconds", "method_kind", "method_params", "group_id", "notes",
            ],
          },
        },
      },
      {
        role: "admin",
        operations: {
          select: {
            filter: OPEN,
            columns: [
              "id", "session_id", "position", "exercise_variant_id", "planned_equipment_id",
              "rest_seconds", "method_kind", "method_params", "group_id", "notes", "created_at",
            ],
            limit: 200,
          },
        },
      },
      {
        role: "super_admin",
        operations: {
          select: {
            filter: OPEN,
            columns: [
              "id", "session_id", "position", "exercise_variant_id", "planned_equipment_id",
              "rest_seconds", "method_kind", "method_params", "group_id", "notes", "created_at",
            ],
            limit: 500,
          },
        },
      },
    ],
  },
  {
    name: "exercise_sets",
    kind: "training",
    columns: [
      "id", "session_exercise_id", "set_index", "target_reps_min", "target_reps_max",
      "target_weight_kg", "target_reps_in_reserve", "target_perceived_exertion", "created_at",
    ],
    objectRelationships: [{ name: "session_exercise", column: "session_exercise_id" }],
    permissions: [
      {
        role: "user",
        operations: {
          select: {
            filter: SESSION_EXERCISE_OWNER,
            columns: [
              "id", "session_exercise_id", "set_index", "target_reps_min", "target_reps_max",
              "target_weight_kg", "target_reps_in_reserve", "target_perceived_exertion", "created_at",
            ],
            limit: 200,
          },
          insert: {
            filter: SESSION_EXERCISE_OWNER,
            columns: [
              "session_exercise_id", "set_index", "target_reps_min", "target_reps_max",
              "target_weight_kg", "target_reps_in_reserve", "target_perceived_exertion",
            ],
          },
          update: {
            filter: SESSION_EXERCISE_OWNER,
            columns: [
              "set_index", "target_reps_min", "target_reps_max",
              "target_weight_kg", "target_reps_in_reserve", "target_perceived_exertion",
            ],
          },
        },
      },
      {
        role: "admin",
        operations: {
          select: {
            filter: OPEN,
            columns: [
              "id", "session_exercise_id", "set_index", "target_reps_min", "target_reps_max",
              "target_weight_kg", "target_reps_in_reserve", "target_perceived_exertion", "created_at",
            ],
            limit: 200,
          },
        },
      },
      {
        role: "super_admin",
        operations: {
          select: {
            filter: OPEN,
            columns: [
              "id", "session_exercise_id", "set_index", "target_reps_min", "target_reps_max",
              "target_weight_kg", "target_reps_in_reserve", "target_perceived_exertion", "created_at",
            ],
            limit: 500,
          },
        },
      },
    ],
  },
  {
    name: "set_results",
    kind: "training",
    columns: [
      "id", "set_id", "user_id", "performed_at", "weight_kg", "reps", "duration_seconds",
      "rest_after_seconds", "perceived_exertion", "reps_in_reserve", "equipment_id", "side",
      "method_kind", "client_mutation_id", "created_at",
    ],
    permissions: athleteOwn(
      [
        "id", "set_id", "user_id", "performed_at", "weight_kg", "reps", "duration_seconds",
        "rest_after_seconds", "perceived_exertion", "reps_in_reserve", "equipment_id", "side",
        "method_kind", "client_mutation_id", "created_at",
      ],
      { insert: true, update: false, delete: false },
    ),
  },
  {
    name: "wearable_devices",
    kind: "athlete",
    columns: [
      "id", "user_id", "provider", "display_name", "device_type", "last_connected_at", "is_active",
      "created_at", "updated_at",
    ],
    permissions: athleteOwn(
      [
        "id", "user_id", "provider", "display_name", "device_type", "last_connected_at", "is_active",
        "created_at", "updated_at",
      ],
      { insert: true, update: ["display_name", "last_connected_at", "is_active"], delete: false },
    ),
  },
  {
    name: "heart_rate_sessions",
    kind: "athlete",
    columns: [
      "id", "user_id", "training_session_id", "wearable_device_id", "started_at", "ended_at",
      "average_bpm", "maximum_bpm", "minimum_bpm", "sample_count", "sensor_coverage",
      "processing_version", "created_at", "updated_at",
    ],
    objectRelationships: [
      { name: "wearable_device", column: "wearable_device_id" },
    ],
    permissions: athleteOwn(
      [
        "id", "user_id", "training_session_id", "wearable_device_id", "started_at", "ended_at",
        "average_bpm", "maximum_bpm", "minimum_bpm", "sample_count", "sensor_coverage",
        "processing_version", "created_at", "updated_at",
      ],
      {
        insert: true,
        update: ["ended_at", "average_bpm", "maximum_bpm", "minimum_bpm", "sample_count", "sensor_coverage"],
        delete: false,
      },
    ),
  },
  {
    name: "heart_rate_samples",
    kind: "athlete",
    columns: [
      "id", "heart_rate_session_id", "user_id", "training_session_id", "exercise_id", "set_id",
      "recorded_at", "bpm", "source", "is_valid", "quality", "quality_reason", "client_mutation_id",
      "created_at",
    ],
    objectRelationships: [{ name: "heart_rate_session", column: "heart_rate_session_id" }],
    permissions: [
      {
        role: "user",
        operations: {
          select: {
            filter: OWN,
            columns: [
              "id", "heart_rate_session_id", "user_id", "training_session_id", "exercise_id", "set_id",
              "recorded_at", "bpm", "source", "is_valid", "quality", "quality_reason", "client_mutation_id",
              "created_at",
            ],
            limit: 5000,
          },
          insert: {
            filter: OWN,
            set: SET_USER,
            columns: [
              "id", "heart_rate_session_id", "training_session_id", "exercise_id", "set_id",
              "recorded_at", "bpm", "source", "is_valid", "quality", "quality_reason", "client_mutation_id",
            ],
          },
        },
      },
      {
        role: "admin",
        operations: {
          select: {
            filter: OPEN,
            columns: [
              "id", "heart_rate_session_id", "user_id", "training_session_id", "exercise_id", "set_id",
              "recorded_at", "bpm", "source", "is_valid", "quality", "quality_reason", "client_mutation_id",
              "created_at",
            ],
            limit: 2000,
          },
        },
      },
      {
        role: "super_admin",
        operations: {
          select: {
            filter: OPEN,
            columns: [
              "id", "heart_rate_session_id", "user_id", "training_session_id", "exercise_id", "set_id",
              "recorded_at", "bpm", "source", "is_valid", "quality", "quality_reason", "client_mutation_id",
              "created_at",
            ],
            limit: 5000,
          },
        },
      },
    ],
  },
  {
    name: "exercise_substitutions",
    kind: "training",
    columns: ["id", "session_exercise_id", "from_variant_id", "to_variant_id", "reason", "created_at"],
    objectRelationships: [{ name: "session_exercise", column: "session_exercise_id" }],
    permissions: [
      {
        role: "user",
        operations: {
          select: {
            filter: SESSION_EXERCISE_OWNER,
            columns: ["id", "session_exercise_id", "from_variant_id", "to_variant_id", "reason", "created_at"],
            limit: 100,
          },
          insert: {
            filter: SESSION_EXERCISE_OWNER,
            columns: ["session_exercise_id", "from_variant_id", "to_variant_id", "reason"],
          },
        },
      },
      {
        role: "admin",
        operations: {
          select: {
            filter: OPEN,
            columns: ["id", "session_exercise_id", "from_variant_id", "to_variant_id", "reason", "created_at"],
            limit: 200,
          },
        },
      },
      {
        role: "super_admin",
        operations: {
          select: {
            filter: OPEN,
            columns: ["id", "session_exercise_id", "from_variant_id", "to_variant_id", "reason", "created_at"],
            limit: 500,
          },
        },
      },
    ],
  },
  {
    name: "rest_timers",
    kind: "training",
    columns: [
      "id", "user_id", "session_id", "session_exercise_id", "set_result_id", "started_at",
      "expected_end_at", "duration_seconds", "paused_at", "remaining_at_pause_seconds", "status",
      "created_at", "updated_at",
    ],
    permissions: athleteOwn(
      [
        "id", "user_id", "session_id", "session_exercise_id", "set_result_id", "started_at",
        "expected_end_at", "duration_seconds", "paused_at", "remaining_at_pause_seconds", "status",
        "created_at", "updated_at",
      ],
      { insert: true, update: true, delete: false },
    ),
  },
  {
    name: "nutrition_profiles",
    kind: "athlete",
    columns: ["id", "user_id", "routine", "restrictions", "hydration_notes", "created_at", "updated_at"],
    permissions: athleteOwn(
      ["id", "user_id", "routine", "restrictions", "hydration_notes", "created_at", "updated_at"],
      { insert: true, update: true, delete: false },
    ),
  },
  {
    name: "nutrition_targets",
    kind: "athlete",
    columns: [
      "id", "user_id", "valid_from", "energy_kcal", "protein_g", "carbohydrate_g", "fat_g", "fluid_ml", "created_at",
    ],
    permissions: athleteOwn(
      ["id", "user_id", "valid_from", "energy_kcal", "protein_g", "carbohydrate_g", "fat_g", "fluid_ml", "created_at"],
      { insert: true, update: false, delete: false },
    ),
  },
  {
    name: "nutrition_checkins",
    kind: "athlete",
    columns: [
      "id", "user_id", "checked_in_on", "energy_kcal", "protein_g", "carbohydrate_g", "fat_g",
      "fluid_ml", "adherence", "notes", "supersedes_id", "created_at",
    ],
    permissions: athleteOwn(
      [
        "id", "user_id", "checked_in_on", "energy_kcal", "protein_g", "carbohydrate_g", "fat_g",
        "fluid_ml", "adherence", "notes", "supersedes_id", "created_at",
      ],
      { insert: true, update: ["energy_kcal", "protein_g", "carbohydrate_g", "fat_g", "fluid_ml", "adherence", "notes"], delete: false },
    ),
  },
  {
    name: "ai_contracts",
    kind: "system",
    columns: ["id", "slug", "created_at"],
    permissions: [
      { role: "user", operations: { select: { filter: OPEN, columns: ["id", "slug", "created_at"], limit: 20 } } },
      { role: "admin", operations: { select: { filter: OPEN, columns: ["id", "slug", "created_at"], limit: 50 } } },
      {
        role: "super_admin",
        operations: {
          select: { filter: OPEN, columns: ["id", "slug", "created_at"], limit: 50 },
          insert: { filter: OPEN, columns: ["slug"] },
          update: { filter: OPEN, columns: ["slug"] },
        },
      },
    ],
  },
  {
    name: "ai_contract_versions",
    kind: "system",
    columns: ["id", "contract_id", "version", "author_user_id", "state", "config", "change_summary", "created_at"],
    permissions: [
      {
        role: "user",
        operations: {
          select: {
            filter: PUBLISHED,
            columns: ["id", "contract_id", "version", "state", "config", "change_summary", "created_at"],
            limit: 20,
          },
        },
      },
      {
        role: "admin",
        operations: {
          select: {
            filter: OPEN,
            columns: ["id", "contract_id", "version", "author_user_id", "state", "config", "change_summary", "created_at"],
            limit: 100,
          },
        },
      },
      {
        role: "super_admin",
        operations: {
          select: {
            filter: OPEN,
            columns: ["id", "contract_id", "version", "author_user_id", "state", "config", "change_summary", "created_at"],
            limit: 100,
          },
          insert: {
            filter: OPEN,
            columns: ["contract_id", "version", "author_user_id", "state", "config", "change_summary"],
          },
          update: { filter: OPEN, columns: ["state", "config", "change_summary"] },
        },
      },
    ],
  },
  {
    name: "ai_contract_publications",
    kind: "system",
    columns: ["id", "version_id", "published_at", "published_by", "environment"],
    permissions: [
      { role: "admin", operations: { select: { filter: OPEN, columns: ["id", "version_id", "published_at", "published_by", "environment"], limit: 50 } } },
      {
        role: "super_admin",
        operations: {
          select: { filter: OPEN, columns: ["id", "version_id", "published_at", "published_by", "environment"], limit: 50 },
          insert: { filter: OPEN, columns: ["version_id", "published_by", "environment"] },
        },
      },
    ],
  },
  {
    name: "ai_runs",
    kind: "system",
    columns: ["id", "user_id", "contract_version_id", "model", "status", "input_context_snapshot", "created_at"],
    permissions: athleteOwn(
      ["id", "user_id", "contract_version_id", "model", "status", "input_context_snapshot", "created_at"],
      { insert: false, update: false, delete: false },
    ),
  },
  {
    name: "ai_decisions",
    kind: "system",
    columns: [
      "id", "run_id", "user_id", "agent", "action", "input_snapshot", "recommendation", "rationale",
      "contract_version_id", "model", "confidence", "accepted", "overridden", "override_reason", "created_at",
    ],
    permissions: athleteOwn(
      [
        "id", "run_id", "user_id", "agent", "action", "input_snapshot", "recommendation", "rationale",
        "contract_version_id", "model", "confidence", "accepted", "overridden", "override_reason", "created_at",
      ],
      { insert: false, update: ["accepted", "overridden", "override_reason"], delete: false },
    ),
  },
  {
    name: "ai_rate_limits",
    kind: "system",
    columns: ["user_id", "window_started_at", "request_count", "updated_at"],
    permissions: [
      { role: "super_admin", operations: { select: { filter: OPEN, columns: ["user_id", "window_started_at", "request_count", "updated_at"], limit: 500 } } },
    ],
  },
  {
    name: "pre_workout_checkins",
    kind: "athlete",
    columns: [
      "id", "user_id", "training_session_id", "checked_in_at", "status", "sleep_quality", "energy",
      "muscle_recovery", "stress", "has_pain", "pain_region", "pain_intensity",
      "pain_worsens_with_movement", "pain_blocks_planned_exercise", "has_planned_time",
      "available_minutes", "client_mutation_id", "created_at",
    ],
    permissions: athleteOwn(
      [
        "id", "user_id", "training_session_id", "checked_in_at", "status", "sleep_quality", "energy",
        "muscle_recovery", "stress", "has_pain", "pain_region", "pain_intensity",
        "pain_worsens_with_movement", "pain_blocks_planned_exercise", "has_planned_time",
        "available_minutes", "client_mutation_id", "created_at",
      ],
      { insert: true, update: false, delete: false },
    ),
  },
  {
    name: "post_workout_checkouts",
    kind: "athlete",
    columns: [
      "id", "user_id", "training_session_id", "checked_out_at", "status", "expectation", "difficulty",
      "plan_completion", "partial_reasons", "had_pain", "client_mutation_id", "created_at",
    ],
    permissions: athleteOwn(
      [
        "id", "user_id", "training_session_id", "checked_out_at", "status", "expectation", "difficulty",
        "plan_completion", "partial_reasons", "had_pain", "client_mutation_id", "created_at",
      ],
      { insert: true, update: false, delete: false },
    ),
  },
  {
    name: "athlete_state_snapshots",
    kind: "athlete",
    columns: [
      "id", "user_id", "period_start", "period_end", "algorithm_version", "overall_state",
      "training_state", "training_confidence", "recovery_state", "recovery_confidence",
      "nutrition_state", "nutrition_confidence", "body_composition_state", "body_composition_confidence",
      "heart_rate_state", "heart_rate_enabled", "heart_rate_confidence", "adherence_state",
      "limitations_json", "alerts_json", "missing_data_json", "reasons_json", "data_quality",
      "payload_json", "generated_at", "client_mutation_id", "created_at",
    ],
    permissions: athleteOwn(
      [
        "id", "user_id", "period_start", "period_end", "algorithm_version", "overall_state",
        "training_state", "training_confidence", "recovery_state", "recovery_confidence",
        "nutrition_state", "nutrition_confidence", "body_composition_state", "body_composition_confidence",
        "heart_rate_state", "heart_rate_enabled", "heart_rate_confidence", "adherence_state",
        "limitations_json", "alerts_json", "missing_data_json", "reasons_json", "data_quality",
        "payload_json", "generated_at", "client_mutation_id", "created_at",
      ],
      { insert: true, update: false, delete: false },
    ),
  },
  {
    name: "weekly_coach_reviews",
    kind: "athlete",
    columns: [
      "id", "user_id", "training_week_id", "athlete_state_snapshot_id", "period_start", "period_end",
      "contract_version", "prompt_version", "model", "agents_json", "headline", "overview",
      "what_improved", "what_needs_attention", "training_copy", "nutrition_copy", "body_copy",
      "recovery_copy", "heart_rate_copy", "next_week_copy", "decision", "suggested_changes_json",
      "status", "ai_run_id", "generated_at", "created_at", "updated_at",
    ],
    objectRelationships: [
      { name: "athlete_state_snapshot", column: "athlete_state_snapshot_id" },
    ],
    arrayRelationships: [
      { name: "decisions", table: "weekly_review_decisions", column: "weekly_review_id" },
    ],
    permissions: athleteOwn(
      [
        "id", "user_id", "training_week_id", "athlete_state_snapshot_id", "period_start", "period_end",
        "contract_version", "prompt_version", "model", "agents_json", "headline", "overview",
        "what_improved", "what_needs_attention", "training_copy", "nutrition_copy", "body_copy",
        "recovery_copy", "heart_rate_copy", "next_week_copy", "decision", "suggested_changes_json",
        "status", "ai_run_id", "generated_at", "created_at", "updated_at",
      ],
      { insert: true, update: ["status"], delete: false },
    ),
  },
  {
    name: "weekly_review_decisions",
    kind: "athlete",
    columns: [
      "id", "user_id", "weekly_review_id", "decision_kind", "suggested_changes_json",
      "accepted_changes_json", "rejected_changes_json", "follow_up_period_start", "follow_up_period_end",
      "follow_up_performance_json", "follow_up_recovery_json", "follow_up_adherence_json",
      "follow_up_nutrition_json", "follow_up_body_json", "created_at", "updated_at",
    ],
    objectRelationships: [{ name: "weekly_review", column: "weekly_review_id" }],
    permissions: athleteOwn(
      [
        "id", "user_id", "weekly_review_id", "decision_kind", "suggested_changes_json",
        "accepted_changes_json", "rejected_changes_json", "follow_up_period_start", "follow_up_period_end",
        "follow_up_performance_json", "follow_up_recovery_json", "follow_up_adherence_json",
        "follow_up_nutrition_json", "follow_up_body_json", "created_at", "updated_at",
      ],
      {
        insert: true,
        update: [
          "accepted_changes_json", "rejected_changes_json", "follow_up_period_start", "follow_up_period_end",
          "follow_up_performance_json", "follow_up_recovery_json", "follow_up_adherence_json",
          "follow_up_nutrition_json", "follow_up_body_json",
        ],
        delete: false,
      },
    ),
  },
  {
    name: "notifications",
    kind: "athlete",
    columns: ["id", "user_id", "type", "payload", "read_at", "created_at"],
    permissions: athleteOwn(
      ["id", "user_id", "type", "payload", "read_at", "created_at"],
      { insert: false, update: ["read_at"], delete: false },
    ),
  },
  {
    name: "audit_logs",
    kind: "system",
    columns: ["id", "actor_user_id", "action", "entity_type", "entity_id", "payload", "created_at"],
    permissions: [
      {
        role: "super_admin",
        operations: {
          select: {
            filter: OPEN,
            columns: ["id", "actor_user_id", "action", "entity_type", "entity_id", "payload", "created_at"],
            limit: 200,
          },
        },
      },
    ],
  },
];
