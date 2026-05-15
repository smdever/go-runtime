export interface WebsocketSink {
  publish(event: unknown): void;
}
