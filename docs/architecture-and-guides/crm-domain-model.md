# CRM Domain Model — izhubs ERP

Understanding the core entities of the izhubs ERP CRM system is crucial for both sales operations and technical integration. The system models the standard B2B sales funnel using four distinct concepts arrayed across two primary dimensions: **The People Axis** and **The Work/Opportunity Axis**.

---

## 1. The People Axis (Entity: `contacts` table)

This axis tracks *who* you are talking to. Both Leads and Contacts are stored in the same database table (`contacts`), differentiated by their `type` or `status` attribute.

### 👤 Lead (Khách hàng tiềm năng)
*   **Definition:** An individual or organization that has shown initial interest (e.g., filled out a web form, left a message on an ad, or handed over a business card). 
*   **System State:** A record in the `contacts` table where `type = 'lead'`.
*   **Purpose:** At this stage, the entity is unqualified. Sales representatives use this stage to filter out "noise" (e.g., competitors, spam, or unqualified buyers) through introductory calls or emails.
*   **Lifecycle:** A Lead is a temporary state. It either gets disqualified (Lost) or qualified into a Contact.

### 👥 Contact (Khách hàng chính thức)
*   **Definition:** A fully qualified individual or company who has a genuine business need, budget, and authority to buy.
*   **System State:** A record in the `contacts` table where `type = 'contact'`.
*   **Purpose:** This is the permanent identity of the customer in your CRM. Once someone becomes a Contact, you have their verified information, and they are ready to participate in sales opportunities.
*   **Lifecycle:** A Contact is permanent. They remain a Contact even if they do not currently have any active sales opportunities.

---

## 2. The Opportunity Axis (Entity: `deals` table)

This axis tracks *what* you are selling to the people. Opportunities are independent of the Contact identity; a single Contact can have multiple simultaneous or sequential opportunities over time.

### 💼 Deal (Cơ hội bán hàng / Thương vụ)
*   **Definition:** A specific, quantifiable sales opportunity currently being negotiated.
*   **System State:** A record in the `deals` table, linked to a specific `contact_id` or `company_id`.
*   **Purpose:** A Deal answers the question: *"What are we trying to sell, for how much, and what stage is the negotiation currently at?"*
*   **Lifecycle:** Deals move across a Kanban board (Pipeline Stages: e.g., Proposal Sent ➔ Negotiation ➔ Contract Drafted). A Deal is an active, ongoing process.

### 🤝 Contract (Hợp đồng)
*   **Definition:** The successful conclusion of a Deal. It represents the formal, legal agreement to provide goods or services in exchange for revenue.
*   **System State:** In izhubs ERP, a Contract is generated when a Deal reaches the final `Won` stage. It may involve moving data into a separate `contracts` module/table for billing, invoicing, and legal tracking.
*   **Purpose:** Contracts transition the relationship from "Sales Execution" to "Service Delivery & Account Management".

---

## The Golden Rule of CRM Flow

> **LEAD** ➔ (qualifies into) ➔ **CONTACT** ➔ (generates one or more) ➔ **DEALS** ➔ (win to become) ➔ **CONTRACTS**.

### Crucial Scenario: The Returning Customer
If an existing Contact returns to purchase a new service:
*   **DO NOT** revert them to a Lead.
*   **DO NOT** create a duplicate Lead record.
*   **DO** keep them as a Contact and create a new **Deal** attached to their existing profile. This preserves the historical relationship and lifetime value (LTV) metrics of the customer.
