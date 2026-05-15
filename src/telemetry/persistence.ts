export interface PersistenceSink {
  store(event: unknown): Promise<void>;
}
