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

export interface SetResultRepository {
  findByClientMutationId(clientMutationId: string): Promise<SetResultRecord | null>;
  insert(row: Omit<SetResultRecord, "id">): Promise<SetResultRecord>;
}
