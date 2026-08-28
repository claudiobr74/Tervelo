export const ADMIN_QUERIES = {
  overview: `
    query AdminOverview($today: timestamptz!, $weekStart: timestamptz!) {
      profiles(limit: 500) { id created_at }
      today_sessions: training_sessions(
        where: {
          _or: [
            { completed_at: { _gte: $today } }
            { started_at: { _gte: $today } }
          ]
        }
        limit: 500
      ) { id status completed_at started_at }
      week_sessions: training_sessions(
        where: {
          _or: [
            { completed_at: { _gte: $weekStart } }
            { started_at: { _gte: $weekStart } }
            { scheduled_at: { _gte: $weekStart } }
          ]
        }
        limit: 500
      ) { id status }
    }
  `,
  users: `
    query AdminUsers {
      profiles(order_by: { created_at: desc }, limit: 200) {
        id
        display_name
        locale
        created_at
      }
      athlete_goals(where: { status: { _eq: "active" } }, limit: 500) {
        user_id
        goal_type
        status
      }
      training_sessions(order_by: { completed_at: desc_nulls_last }, limit: 400) {
        user_id
        status
        completed_at
        started_at
      }
    }
  `,
  training: `
    query AdminTraining {
      training_programs(order_by: { updated_at: desc }, limit: 200) {
        id
        user_id
        title
        status
        started_on
        source
        updated_at
      }
      training_sessions(order_by: { scheduled_at: desc_nulls_last }, limit: 200) {
        id
        user_id
        status
        scheduled_at
        started_at
        completed_at
      }
    }
  `,
  nutrition: `
    query AdminNutrition {
      nutrition_profiles(order_by: { updated_at: desc }, limit: 200) {
        id
        user_id
        routine
        restrictions
        hydration_notes
        updated_at
      }
      nutrition_targets(order_by: { valid_from: desc }, limit: 200) {
        id
        user_id
        valid_from
        energy_kcal
        protein_g
        carbohydrate_g
        fat_g
        fluid_ml
      }
    }
  `,
  exercises: `
    query AdminExercises {
      canonical_exercises(order_by: { name_pt: asc }, limit: 2000) {
        id
        name_pt
        description
        movement_pattern_id
      }
      exercise_aliases(limit: 4000) {
        alias
        locale
        canonical_exercise_id
      }
      movement_patterns(order_by: { name_pt: asc }, limit: 50) {
        id
        slug
        name_pt
      }
    }
  `,
  insertExercise: `
    mutation AdminInsertExercise($name_pt: String!, $description: String, $movement_pattern_id: uuid) {
      insert_canonical_exercises_one(object: {
        name_pt: $name_pt
        description: $description
        movement_pattern_id: $movement_pattern_id
      }) { id name_pt }
    }
  `,
  equipment: `
    query AdminEquipment {
      equipment(order_by: { name_pt: asc }, limit: 400) {
        id
        name_pt
        resistance_system
        starting_load_kg
        increment_kg
        category_id
      }
      equipment_categories(order_by: { name_pt: asc }, limit: 50) {
        id
        slug
        name_pt
      }
    }
  `,
  insertEquipment: `
    mutation AdminInsertEquipment($name_pt: String!, $category_id: uuid, $resistance_system: String) {
      insert_equipment_one(object: {
        name_pt: $name_pt
        category_id: $category_id
        resistance_system: $resistance_system
      }) { id name_pt }
    }
  `,
  gyms: `
    query AdminGyms {
      gyms(order_by: { name: asc }, limit: 100) {
        id
        name
        notes
        owner_user_id
      }
    }
  `,
  insertGym: `
    mutation AdminInsertGym($name: String!, $notes: String) {
      insert_gyms_one(object: { name: $name, notes: $notes }) { id name notes owner_user_id }
    }
  `,
  inventory: `
    query AdminGymInventory($gymId: uuid!) {
      gyms(where: { id: { _eq: $gymId } }, limit: 1) { id name owner_user_id notes }
      gym_plates(where: { gym_id: { _eq: $gymId } }, order_by: { weight_kg: asc }) {
        id weight_kg quantity
      }
      gym_bars(where: { gym_id: { _eq: $gymId } }) {
        id bar_kind actual_weight_kg name quantity
      }
      gym_dumbbell_sets(where: { gym_id: { _eq: $gymId } }) {
        id weights_kg min_kg max_kg increment_kg
      }
      gym_equipment(where: { gym_id: { _eq: $gymId } }) {
        id equipment_id quantity is_available
      }
      equipment(order_by: { name_pt: asc }, limit: 200) { id name_pt }
    }
  `,
  insertPlate: `
    mutation AdminInsertPlate($gym_id: uuid!, $weight_kg: numeric!, $quantity: Int!) {
      insert_gym_plates_one(object: { gym_id: $gym_id, weight_kg: $weight_kg, quantity: $quantity }) { id }
    }
  `,
  updatePlate: `
    mutation AdminUpdatePlate($id: uuid!, $quantity: Int!) {
      update_gym_plates_by_pk(pk_columns: { id: $id }, _set: { quantity: $quantity }) { id quantity }
    }
  `,
  insertBar: `
    mutation AdminInsertBar($gym_id: uuid!, $name: String!, $actual_weight_kg: numeric!, $bar_kind: String!) {
      insert_gym_bars_one(object: {
        gym_id: $gym_id
        name: $name
        actual_weight_kg: $actual_weight_kg
        bar_kind: $bar_kind
        quantity: 1
      }) { id }
    }
  `,
  audit: `
    query AdminAudit {
      audit_logs(order_by: { created_at: desc }, limit: 200) {
        id actor_user_id action entity_type entity_id payload created_at
      }
      ai_decisions(order_by: { created_at: desc }, limit: 200) {
        id user_id agent action rationale created_at accepted overridden
      }
    }
  `,
  alerts: `
    query AdminAlerts {
      audit_logs(order_by: { created_at: desc }, limit: 20) {
        id action entity_type created_at
      }
    }
  `,
  aiContract: `
    query AdminAiContract($slug: String!) {
      ai_contracts(where: { slug: { _eq: $slug } }, limit: 1) {
        id
        slug
        created_at
      }
      ai_contract_versions(order_by: { version: desc }, limit: 40) {
        id
        contract_id
        version
        state
        config
        change_summary
        author_user_id
        created_at
      }
    }
  `,
  search: `
    query AdminSearch {
      profiles(limit: 200) { id display_name }
      canonical_exercises(limit: 2000) { id name_pt }
    }
  `,
  insertAiContract: `
    mutation AdminInsertAiContract($slug: String!) {
      insert_ai_contracts_one(object: { slug: $slug }) { id slug created_at }
    }
  `,
  insertAiVersion: `
    mutation AdminInsertAiVersion(
      $contract_id: uuid!
      $version: Int!
      $author_user_id: uuid
      $state: String!
      $config: jsonb!
      $change_summary: String
    ) {
      insert_ai_contract_versions_one(object: {
        contract_id: $contract_id
        version: $version
        author_user_id: $author_user_id
        state: $state
        config: $config
        change_summary: $change_summary
      }) { id version state created_at }
    }
  `,
  updateAiVersionState: `
    mutation AdminUpdateAiVersionState($id: uuid!, $state: String!) {
      update_ai_contract_versions_by_pk(pk_columns: { id: $id }, _set: { state: $state }) { id state }
    }
  `,
  insertPublication: `
    mutation AdminInsertPublication($version_id: uuid!, $published_by: uuid, $environment: String!) {
      insert_ai_contract_publications_one(object: {
        version_id: $version_id
        published_by: $published_by
        environment: $environment
      }) { id published_at environment }
    }
  `,
  insertAiRun: `
    mutation AdminInsertAiRun(
      $user_id: uuid!
      $contract_version_id: uuid
      $model: String
      $status: String!
      $input_context_snapshot: jsonb!
    ) {
      insert_ai_runs_one(object: {
        user_id: $user_id
        contract_version_id: $contract_version_id
        model: $model
        status: $status
        input_context_snapshot: $input_context_snapshot
      }) { id status created_at }
    }
  `,
  insertAudit: `
    mutation AdminInsertAudit($action: String!, $entity_type: String!, $entity_id: uuid, $payload: jsonb!) {
      insert_audit_logs_one(object: {
        action: $action
        entity_type: $entity_type
        entity_id: $entity_id
        payload: $payload
      }) { id created_at }
    }
  `,
  profile: `
    query AdminSelf($id: uuid!) {
      profiles(where: { id: { _eq: $id } }, limit: 1) { id display_name locale }
    }
  `,
} as const;
