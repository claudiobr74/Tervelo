export const ATHLETE_QUERIES = {
  catalog: `
    query AthleteCatalog {
      canonical_exercises(order_by: { name_pt: asc }, limit: 2000) {
        id name_pt description movement_pattern_id
      }
      exercise_aliases(limit: 4000) { alias locale canonical_exercise_id }
      movement_patterns(limit: 50) { id slug name_pt }
      exercise_muscles(limit: 1000) { exercise_id muscle_id role }
      muscles(limit: 200) { id name_pt }
      exercise_variants(limit: 400) { id canonical_exercise_id name_pt }
      exercise_equipment(limit: 800) { exercise_variant_id equipment_id }
      equipment(order_by: { name_pt: asc }, limit: 400) {
        id name_pt resistance_system starting_load_kg increment_kg category_id independent_arms
      }
      equipment_categories(limit: 50) { id slug name_pt }
    }
  `,
  inventory: `
    query AthleteInventory {
      gyms(order_by: { name: asc }, limit: 50) { id name notes }
      gym_plates(limit: 200) { id gym_id weight_kg quantity }
      gym_bars(limit: 200) { id gym_id name bar_kind actual_weight_kg quantity }
      gym_dumbbell_sets(limit: 50) { id gym_id weights_kg min_kg max_kg increment_kg }
      gym_equipment(limit: 200) { id gym_id equipment_id quantity notes is_available }
    }
  `,
  insertPlate: `
    mutation AthleteInsertPlate($gym_id: uuid!, $weight_kg: numeric!, $quantity: Int!) {
      insert_gym_plates_one(object: { gym_id: $gym_id, weight_kg: $weight_kg, quantity: $quantity }) {
        id gym_id weight_kg quantity
      }
    }
  `,
  insertBar: `
    mutation AthleteInsertBar(
      $gym_id: uuid!
      $name: String!
      $bar_kind: String!
      $actual_weight_kg: numeric!
      $quantity: Int!
    ) {
      insert_gym_bars_one(object: {
        gym_id: $gym_id
        name: $name
        bar_kind: $bar_kind
        actual_weight_kg: $actual_weight_kg
        quantity: $quantity
      }) { id gym_id name actual_weight_kg }
    }
  `,
  insertGymEquipment: `
    mutation AthleteInsertGymEquipment($gym_id: uuid!, $equipment_id: uuid!, $quantity: Int!) {
      insert_gym_equipment_one(object: {
        gym_id: $gym_id
        equipment_id: $equipment_id
        quantity: $quantity
        is_available: true
      }) { id gym_id equipment_id quantity }
    }
  `,
  training: `
    query AthleteTraining {
      training_programs(order_by: { updated_at: desc }, limit: 50) {
        id title status started_on source updated_at
      }
      training_blocks(limit: 100) { id program_id position name intent }
      training_weeks(limit: 100) { id block_id week_index notes }
      training_sessions(order_by: { scheduled_at: desc_nulls_last }, limit: 100) {
        id week_id gym_id scheduled_at started_at completed_at status
      }
      session_exercises(order_by: { position: asc }, limit: 400) {
        id session_id position rest_seconds method_kind notes planned_equipment_id exercise_variant_id
      }
      exercise_sets(limit: 800) {
        id session_exercise_id set_index target_reps_min target_reps_max target_weight_kg target_reps_in_reserve
      }
      exercise_variants(limit: 400) { id canonical_exercise_id name_pt }
      canonical_exercises(limit: 2000) { id name_pt }
    }
  `,
  insertProgram: `
    mutation AthleteInsertProgram($title: String!, $started_on: date) {
      insert_training_programs_one(object: {
        title: $title
        status: "active"
        source: "user"
        started_on: $started_on
      }) { id title }
    }
  `,
  insertBlock: `
    mutation AthleteInsertBlock($program_id: uuid!, $name: String) {
      insert_training_blocks_one(object: {
        program_id: $program_id
        position: 1
        name: $name
      }) { id }
    }
  `,
  insertWeek: `
    mutation AthleteInsertWeek($block_id: uuid!) {
      insert_training_weeks_one(object: { block_id: $block_id, week_index: 1 }) { id }
    }
  `,
  insertSession: `
    mutation AthleteInsertSession($week_id: uuid, $scheduled_at: timestamptz, $gym_id: uuid) {
      insert_training_sessions_one(object: {
        week_id: $week_id
        scheduled_at: $scheduled_at
        gym_id: $gym_id
        status: "planned"
      }) { id scheduled_at status }
    }
  `,
  insertSessionExercise: `
    mutation AthleteInsertSessionExercise(
      $session_id: uuid!
      $position: Int!
      $notes: String
      $rest_seconds: Int
      $planned_equipment_id: uuid
      $exercise_variant_id: uuid
    ) {
      insert_session_exercises_one(object: {
        session_id: $session_id
        position: $position
        notes: $notes
        rest_seconds: $rest_seconds
        method_kind: "working"
        planned_equipment_id: $planned_equipment_id
        exercise_variant_id: $exercise_variant_id
      }) { id }
    }
  `,
  insertExerciseSet: `
    mutation AthleteInsertExerciseSet(
      $session_exercise_id: uuid!
      $set_index: Int!
      $target_reps_min: Int
      $target_reps_max: Int
      $target_weight_kg: numeric
    ) {
      insert_exercise_sets_one(object: {
        session_exercise_id: $session_exercise_id
        set_index: $set_index
        target_reps_min: $target_reps_min
        target_reps_max: $target_reps_max
        target_weight_kg: $target_weight_kg
      }) { id }
    }
  `,
  coachFacts: `
    query AthleteCoachFacts {
      body_measurements(order_by: { measured_at: desc }, limit: 10) {
        weight_kg measured_at
      }
      recovery_checkins(order_by: { checked_in_at: desc }, limit: 5) {
        perceived_recovery muscle_soreness checked_in_at
      }
      training_sessions(order_by: { completed_at: desc_nulls_last }, limit: 10) {
        id status completed_at scheduled_at
      }
      set_results(order_by: { performed_at: desc }, limit: 50) {
        weight_kg reps reps_in_reserve performed_at
      }
      nutrition_checkins(order_by: { checked_in_on: desc }, limit: 5) {
        energy_kcal protein_g carbohydrate_g fat_g fluid_ml adherence
      }
    }
  `,
  adminUser: `
    query AdminUserDetail($id: uuid!) {
      profiles(where: { id: { _eq: $id } }, limit: 1) {
        id display_name locale created_at theme_preference
      }
      athlete_profiles(where: { user_id: { _eq: $id } }, limit: 1) {
        birth_date sex height_cm experience_level
      }
      athlete_goals(where: { user_id: { _eq: $id } }, order_by: { created_at: desc }, limit: 20) {
        id goal_type status notes created_at
      }
      training_programs(where: { user_id: { _eq: $id } }, order_by: { updated_at: desc }, limit: 20) {
        id title status started_on
      }
      training_sessions(where: { user_id: { _eq: $id } }, order_by: { scheduled_at: desc_nulls_last }, limit: 30) {
        id status scheduled_at started_at completed_at
      }
      body_measurements(where: { user_id: { _eq: $id } }, order_by: { measured_at: desc }, limit: 10) {
        measured_at weight_kg body_fat_percent
      }
    }
  `,
} as const;
