// src\runtime\emitter.ts
import type { RuntimeEvent, RuntimeEventName } from "../contracts/events.js";

type RuntimeListener = (event: RuntimeEvent) => void;

export class RuntimeEmitter {
  private anyListeners = new Set<RuntimeListener>();
  private namedListeners = new Map<RuntimeEventName, Set<RuntimeListener>>();

  emit(event: RuntimeEvent): void {
    for (const listener of this.anyListeners) {
      listener(event);
    }

    const listeners = this.namedListeners.get(event.name);
    if (!listeners) return;

    for (const listener of listeners) {
      listener(event);
    }
  }

  subscribe(listener: RuntimeListener): () => void {
    this.anyListeners.add(listener);
    return () => {
      this.anyListeners.delete(listener);
    };
  }

  subscribeTo(name: RuntimeEventName, listener: RuntimeListener): () => void {
    let listeners = this.namedListeners.get(name);
    if (!listeners) {
      listeners = new Set<RuntimeListener>();
      this.namedListeners.set(name, listeners);
    }

    listeners.add(listener);

    return () => {
      const current = this.namedListeners.get(name);
      if (!current) return;

      current.delete(listener);
      if (current.size === 0) {
        this.namedListeners.delete(name);
      }
    };
  }

  clear(): void {
    this.anyListeners.clear();
    this.namedListeners.clear();
  }
}
