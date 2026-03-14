// =============================================================
// izhubs ERP — System Events
// All state changes MUST emit an event.
// Extensions and modules subscribe here — never hook core directly.
// =============================================================

import type { User, Contact, Company, Deal, Activity, DealStage } from './entities';

export type SystemEvents = {
  // User events
  'user.created': { user: User };
  'user.updated': { user: User; changes: Partial<User> };
  'user.deactivated': { userId: string };

  // Contact events
  'contact.created': { contact: Contact };
  'contact.updated': { contact: Contact; changes: Partial<Contact> };
  'contact.deleted': { contactId: string };

  // Company events
  'company.created': { company: Company };
  'company.updated': { company: Company; changes: Partial<Company> };
  'company.deleted': { companyId: string };

  // Deal events
  'deal.created': { deal: Deal };
  'deal.updated': { deal: Deal; changes: Partial<Deal> };
  'deal.stage_changed': { deal: Deal; fromStage: DealStage; toStage: DealStage };
  'deal.won': { deal: Deal };
  'deal.lost': { deal: Deal };
  'deal.deleted': { dealId: string };

  // Activity events
  'activity.created': { activity: Activity };
  'activity.completed': { activity: Activity };
  'activity.deleted': { activityId: string };
};

export type EventName = keyof SystemEvents;
export type EventPayload<T extends EventName> = SystemEvents[T];
