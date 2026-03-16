# The Wedge - AI CSV Import

## Overview
Status: Planning
Type: Feature

**Trigger:** Phase 4 of the All-in-one ERP Bootstrapping roadmap.
**Goal:** Build the key feature that draws users away from Airtable/Notion — CSV upload and automated parsing.
**Success Criteria:** Upload a CSV exported from Airtable and have it map into Contacts and Deals table with minimal user intervention.

## Phase 1: Upload & Parse
- [ ] Create UI for drag-and-drop CSV upload.
- [ ] Parse CSV in browser or server.

## Phase 2: AI Column Mapping
- [ ] Send sample headers/rows to LLM to predict mapping to `Contact` and `Deal` schema.
- [ ] Present proposed mapping to the user for review/override.

## Phase 3: Ingestion
- [ ] Bulk create Contacts.
- [ ] Bulk create Deals associated with the Contacts.
- [ ] Show import success metrics.
