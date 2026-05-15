export interface WorkerRecord {
  runId: string;
  pid?: number;
}

export class WorkerRegistry {
  private readonly byRun = new Map<string, WorkerRecord>();

  set(record: WorkerRecord): void {
    this.byRun.set(record.runId, record);
  }

  get(runId: string): WorkerRecord | undefined {
    return this.byRun.get(runId);
  }

  delete(runId: string): void {
    this.byRun.delete(runId);
  }

  list(): WorkerRecord[] {
    return [...this.byRun.values()];
  }
}
