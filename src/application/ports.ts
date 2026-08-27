export type MeasurementRecord = {
  id: string;
  userId: string;
  measuredAt: string;
  source: string;
  weightKg?: number;
  bodyFatPercent?: number;
  waistCm?: number;
  rightArmCm?: number;
  rightThighCm?: number;
  notes?: string;
  supersedesId?: string;
};

export type RecoveryCheckinRecord = {
  id: string;
  userId: string;
  checkedInAt: string;
  sleepQuality: number;
  energy: number;
  mood: number;
  muscleSoreness: number;
  discomfort: number;
  stress: number;
  perceivedRecovery: number;
  notes?: string;
};

export type SetResultRecord = {
  id: string;
  userId: string;
  setId: string;
  clientMutationId: string;
  weightKg?: number;
  reps?: number;
};

export interface MeasurementRepository {
  insert(row: Omit<MeasurementRecord, "id">): Promise<MeasurementRecord>;
}

export interface RecoveryCheckinRepository {
  insert(row: Omit<RecoveryCheckinRecord, "id">): Promise<RecoveryCheckinRecord>;
}

export type NutritionCheckinRecord = {
  id: string;
  userId: string;
  checkedInOn: string;
  energyKcal?: number;
  proteinG?: number;
  carbohydrateG?: number;
  fatG?: number;
  fluidMl?: number;
  notes?: string;
  supersedesId?: string;
};

export interface NutritionCheckinRepository {
  insert(row: Omit<NutritionCheckinRecord, "id">): Promise<NutritionCheckinRecord>;
}

export interface SetResultRepository {
  findByClientMutationId(clientMutationId: string): Promise<SetResultRecord | null>;
  insert(row: Omit<SetResultRecord, "id">): Promise<SetResultRecord>;
}

export type PreWorkoutCheckinRecord = {
  id: string;
  userId: string;
  clientMutationId: string;
  status: "completed" | "skipped";
  checkedInAt: string;
  sleepQuality?: number;
  energy?: number;
  muscleRecovery?: number;
  stress?: number;
  hasPain?: boolean;
  availableMinutes?: number;
};

export type PostWorkoutCheckoutRecord = {
  id: string;
  userId: string;
  clientMutationId: string;
  status: "completed" | "skipped";
  checkedOutAt: string;
  expectation?: string;
  difficulty?: string;
  planCompletion?: string;
  partialReasons?: string[];
  hadPain?: boolean;
};

export interface PreWorkoutCheckinRepository {
  findByClientMutationId(clientMutationId: string): Promise<PreWorkoutCheckinRecord | null>;
  insert(row: Omit<PreWorkoutCheckinRecord, "id">): Promise<PreWorkoutCheckinRecord>;
}

export interface PostWorkoutCheckoutRepository {
  findByClientMutationId(clientMutationId: string): Promise<PostWorkoutCheckoutRecord | null>;
  insert(row: Omit<PostWorkoutCheckoutRecord, "id">): Promise<PostWorkoutCheckoutRecord>;
}
