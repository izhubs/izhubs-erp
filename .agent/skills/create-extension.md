---
name: create-extension
description: Build a guardrailed extension/plugin for izhubs ERP. Extensions communicate ONLY via EventBus + Core API — never touch the database directly.
---

# Skill: Create Extension

## Extensions vs Modules

| | Module | Extension |
|--|--|--|
| **Who builds** | izhubs team | Community / third-party |
| **DB access** | Module-level pool (not core tables) | ❌ No DB access ever |
| **Deploy** | Built into app | Hot-loaded from marketplace |
| **Trust level** | High | Sandboxed |

## Extension Structure

```
extensions/
  my-extension/
    manifest.json     ← Required: identity, permissions, entry point
    index.ts          ← Entry point (extends ExtensionBase)
    README.md         ← What it does, config options
```

## Step 1: `manifest.json`

```json
{
  "id": "com.izhubs.slack-notifications",
  "name": "Slack Notifications",
  "version": "1.0.0",
  "author": "Your Name <you@example.com>",
  "description": "Send Slack alerts on deal stage changes and wins.",
  "entryPoint": "index.ts",
  "permissions": [
    "events:deal.won",
    "events:deal.stage_changed",
    "api:deals:read",
    "api:contacts:read"
  ],
  "config": {
    "webhookUrl": { "type": "string", "label": "Slack Webhook URL", "secret": true }
  }
}
```

**Permissions are enforced by the SDK** — extensions can only access what's declared.

## Step 2: `index.ts` (extend `ExtensionBase`)

```typescript
import { ExtensionBase } from '@/core/engine/extension-base'

export default class SlackNotificationsExtension extends ExtensionBase {
  async onInstall() {
    this.log('Slack Notifications installed')
  }

  async onActivate() {
    // Subscribe only to declared events
    this.on('deal.won', async ({ deal }) => {
      const webhookUrl = this.config.get('webhookUrl')
      await fetch(webhookUrl, {
        method: 'POST',
        body: JSON.stringify({ text: `🎉 Deal won: ${deal.name}` })
      })
    })

    this.on('deal.stage_changed', async ({ deal, toStage }) => {
      if (toStage === 'proposal') {
        // Use Core API — never direct DB
        const contact = await this.api.get(`/api/v1/contacts/${deal.contactId}`)
        await this.notifySlack(`📋 ${contact.name} moved to proposal stage`)
      }
    })
  }

  async onDeactivate() {
    this.off('deal.won')
    this.off('deal.stage_changed')
    this.log('Slack Notifications deactivated')
  }

  private async notifySlack(message: string) {
    const webhookUrl = this.config.get('webhookUrl')
    if (!webhookUrl) return
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message })
    })
  }
}
```

## SDK Capabilities (what extensions CAN do)

```typescript
// Available via `this` in ExtensionBase:
this.on(eventName, handler)         // Subscribe to permitted events
this.off(eventName)                 // Unsubscribe
this.api.get('/api/v1/...')         // Read-only Core API calls
this.api.post('/api/v1/...')        // Write Core API (if permission granted)
this.config.get('keyName')          // Read extension config (secrets masked)
this.log('message')                 // Structured logging (appears in admin UI)
this.schedule('0 9 * * *', fn)     // Cron-like scheduling
```

## What Extensions CANNOT do

- ❌ Import `db` or any DB driver
- ❌ Access `core/schema/` directly
- ❌ Call other extensions' code
- ❌ Use any permission not declared in `manifest.json`
- ❌ Persist data (use Core API to write via permitted routes)

## Checklist before submitting to marketplace

- [ ] `manifest.json` with all required fields
- [ ] Only declared permissions used in code
- [ ] Error handling in all event handlers (never crash)
- [ ] `onDeactivate()` cleans up all handlers
- [ ] No direct imports from `core/engine/` except `ExtensionBase`
- [ ] README with setup instructions and config options
- [ ] Tested with `npm run test:extensions`
