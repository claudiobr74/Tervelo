export type MeasurementRecord = {
  id: string;
  userId: string;
  measuredAt: string;
  source: string;
  weightKg?: number;
  bodyFatPercent?: number;
  notes?: string;
  supersedesId?: string;
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

export interface SetResultRepository {
  findByClientMutationId(clientMutationId: string): Promise<SetResultRecord | null>;
  insert(row: Omit<SetResultRecord, "id">): Promise<SetResultRecord>;
}
