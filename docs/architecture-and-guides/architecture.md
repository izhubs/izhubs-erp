# Architecture: Guardrailed Extensions

## The Vision
izhubs ERP is designed as a Platform. The core engine remains immutable, while community developers build industry-specific features via Extensions (Plugins). 

To ensure the system never breaks and user data is never leaked or destroyed by poorly written or malicious plugins, all Extensions must run within a **Strict Sandbox Architecture**.

## The 3-Layer Security Model

### Layer 1: Data Flow Safety (The Event Bus)
Extensions **never** have direct Database (PostgreSQL) access. They cannot run SQL queries or use Prisma/TypeORM directly.
- **Mechanism**: The core Next.js App (`core/engine/*`) emits events (e.g., `deal.created`, `invoice.paid`) to a **BullMQ Queue** (backed by Redis).
- **Benefit**: Extensions run asynchronously in the background. If a plugin crashes or runs an infinite loop, it only stalls the isolated background worker, not the main Next.js thread.

### Layer 2: Execution Safety (The V8 Isolate)
To prevent Extensions from interacting with the underlying OS file system or performing unauthorized network requests, their code is executed inside a V8 Isolate Sandbox (using the `isolated-vm` library), similar to Cloudflare Workers or Figma Plugins.
- **No `require()`**: Extensions cannot import `fs`, `child_process`, or any arbitrary Node.js modules.
- **Resource Limits**: 
  - **Memory Limit**: Max 64MB RAM per execution context.
  - **Time Limit**: Max 500ms execution time (prevents `while(true)` freezes).
- **Stateless**: The Isolate is spun up when an event occurs, the code runs, and the Isolate is immediately destroyed. Extensions cannot share global memory states.

### Layer 3: Network Isolation (The Controlled I/O)
Extensions cannot use `fetch()` or `axios` directly to exfiltrate data.
- **Controlled API SDK**: We inject an `izhubs` SDK object into the V8 context. If an extension wants to send a webhook to Zalo, it must call `izhubs.http.post()`.
- **Benefit**: The Core system logs every outbound request. Users can view the Audit Log to see exactly what external endpoints a specific plugin is talking to.

---

## ⚙️ The Data Flow (Real-world Example)

**Scenario**: A user installs a "Slack Notifier" extension that sends a message when a Deal > $10,000 is marked as Won.

1. **User Action**: User moves a deal to "Won" in the Kanban board.
2. **Core System**: `core/engine/deals.ts` successfully updates PostgreSQL.
3. **Event Emission**: `eventBus.emit('deal.won', { dealId: 101, value: 15000, tenantId: 2 })` is sent to BullMQ. Next.js returns `200 OK` to the browser instantly.
4. **The Sandbox Manager (Worker)**:
   - BullMQ picks up the job.
   - The Manager creates a new `isolated-vm` instance (The Sandbox).
   - Injects the event payload: `context.setSync('eventPayload', payload)`.
   - Injects the SDK: `context.setSync('izhubsSdk', secureSdkBindings)`.
5. **Extension Execution**: The Slack Notifier code runs inside the Sandbox:
   ```javascript
   // Running inside isolated-vm
   export default async function onEvent(payload, izhubs) {
       if (payload.eventName === 'deal.won' && payload.data.value > 10000) {
           const deal = await izhubs.api.deals.get(payload.data.dealId);
           await izhubs.http.post('https://hooks.slack.com/services/XXX', { text: `Huge deal won: ${deal.title}!` });
       }
   }
   ```
6. **Cleanup**: The code finishes, or hits the 500ms timeout. The Sandbox is destroyed. The Worker marks the BullMQ job as complete.

---

> **Note for v0.1 - v0.2 Builders**: 
> This is the *end-state architecture*. When bootstrapping the first version of the platform, focus heavily on structuring the `core/engine` cleanly and emitting events to BullMQ. The `isolated-vm` strict sandbox can be layered on top during the `v0.4+ Extension Platform` phase once the first party plugins are proven to work using standard Node.js callbacks.
