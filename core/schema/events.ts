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

  // Contract events (biz-ops)
  'contract.created': { contract: Record<string, unknown> };
  'contract.updated': { contract: Record<string, unknown> };
  'contract.deleted': { id: string };

  // Milestone events (biz-ops)
  'milestone.created': { milestone: Record<string, unknown> };
  'milestone.updated': { milestone: Record<string, unknown> };
  'milestone.deleted': { id: string };

  // Campaign events (biz-ops)
  'campaign.created': { campaign: Record<string, unknown> };
  'campaign.updated': { campaign: Record<string, unknown> };
  'campaign.deleted': { id: string };

  // Portfolio events (biz-ops)
  'portfolio.created': { portfolio: Record<string, unknown> };
  'portfolio.updated': { portfolio: Record<string, unknown> };
  'portfolio.deleted': { id: string };

  // Campaign Phase events (biz-ops)
  'campaign_phase.created': { phase: Record<string, unknown> };
  'campaign_phase.updated': { phase: Record<string, unknown> };
  'campaign_phase.deleted': { id: string };
};

export type EventName = keyof SystemEvents;
export type EventPayload<T extends EventName> = SystemEvents[T];
