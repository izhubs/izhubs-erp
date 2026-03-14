import type { EventName, EventPayload } from '../../core/schema/events';
import type { EventBus } from '../../core/engine/event-bus';

// =============================================================
// izhubs ERP — Extension SDK
// All extensions MUST extend ExtensionBase.
// Extensions communicate ONLY through EventBus and CoreAPI.
// NEVER import pg or DB utilities directly.
// =============================================================

export interface ExtensionManifest {
  name: string;         // Unique extension identifier (kebab-case)
  version: string;      // Semver: "1.0.0"
  description: string;
  author: string;
  permissions: PermissionScope[];
  events: EventName[];  // Events this extension subscribes to
}

export type PermissionScope =
  | 'contacts:read' | 'contacts:write'
  | 'companies:read' | 'companies:write'
  | 'deals:read' | 'deals:write'
  | 'activities:read' | 'activities:write'
  | 'users:read';

export interface CoreAPI {
  contacts: {
    findById: (id: string) => Promise<unknown>;
    list: (filters?: Record<string, unknown>) => Promise<unknown[]>;
  };
  deals: {
    findById: (id: string) => Promise<unknown>;
    list: (filters?: Record<string, unknown>) => Promise<unknown[]>;
    updateStage: (id: string, stage: string) => Promise<unknown>;
  };
  activities: {
    create: (data: Record<string, unknown>) => Promise<unknown>;
  };
}

export abstract class ExtensionBase {
  abstract readonly manifest: ExtensionManifest;

  constructor(
    protected readonly eventBus: EventBus,
    protected readonly api: CoreAPI,
  ) {}

  /** Called when the extension is installed */
  abstract onInstall(): Promise<void>;

  /** Called when the extension is uninstalled */
  abstract onUninstall(): Promise<void>;

  /** Register event listeners — called automatically after install */
  protected on<T extends EventName>(event: T, handler: (payload: EventPayload<T>) => void | Promise<void>): void {
    if (!this.manifest.events.includes(event)) {
      throw new Error(`Extension "${this.manifest.name}" is not declared to listen to "${event}"`);
    }
    this.eventBus.on(event, handler);
  }
}
