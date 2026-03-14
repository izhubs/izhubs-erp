import type { EventName, EventPayload } from '../schema/events';

// =============================================================
// izhubs ERP — Event Bus
// All modules and extensions communicate through this.
// Never import DB or other modules directly — use events + API.
// =============================================================

type Listener<T extends EventName> = (payload: EventPayload<T>) => void | Promise<void>;

export class EventBus {
  private listeners: Map<string, Listener<EventName>[]> = new Map();

  on<T extends EventName>(event: T, listener: Listener<T>): void {
    const existing = this.listeners.get(event) ?? [];
    this.listeners.set(event, [...existing, listener as Listener<EventName>]);
  }

  off<T extends EventName>(event: T, listener: Listener<T>): void {
    const existing = this.listeners.get(event) ?? [];
    this.listeners.set(event, existing.filter(l => l !== listener));
  }

  async emit<T extends EventName>(event: T, payload: EventPayload<T>): Promise<void> {
    const listeners = this.listeners.get(event) ?? [];
    await Promise.all(listeners.map(l => l(payload as EventPayload<EventName>)));
  }
}

// Singleton — import this everywhere
export const eventBus = new EventBus();
