/**
 * core/engine/import-ai.ts
 * ============================================================
 * AI-assisted CSV column mapping.
 *
 * Strategy:
 *  1. If OPENAI_API_KEY is set → use GPT-4o-mini (cheap, fast)
 *  2. Fallback → fuzzy string similarity against known field names
 *     (works out of the box for any standard Airtable/Notion export)
 * ============================================================
 */

// Known target fields per entity type
const CONTACT_FIELDS: Record<string, string[]> = {
  name:    ['name', 'full name', 'fullname', 'contact name', 'person', 'client name', 'customer name', 'ten', 'họ tên'],
  email:   ['email', 'e-mail', 'email address', 'mail'],
  phone:   ['phone', 'phone number', 'mobile', 'cell', 'telephone', 'tel', 'số điện thoại'],
  title:   ['title', 'job title', 'position', 'role', 'chức vụ'],
  company: ['company', 'company name', 'organization', 'org', 'firm', 'công ty'],
};

const DEAL_FIELDS: Record<string, string[]> = {
  name:    ['name', 'deal name', 'opportunity', 'project', 'subject', 'title'],
  value:   ['value', 'amount', 'deal size', 'price', 'revenue', 'budget', 'price', 'giá trị'],
  stage:   ['stage', 'status', 'pipeline stage', 'sales stage', 'trạng thái'],
  contact: ['contact', 'contact name', 'person', 'client', 'customer', 'lead'],
};

type EntityType = 'contacts' | 'deals';
export type ColumnMapping = Record<string, string>; // csvColumn → schemaField

/**
 * Map CSV column headers to ERP schema fields.
 * Returns a mapping object that the user can review/override.
 */
export async function mapColumns(
  headers: string[],
  entityType: EntityType
): Promise<ColumnMapping> {
  // Try AI mapping first
  if (process.env.OPENAI_API_KEY) {
    try {
      return await mapWithOpenAI(headers, entityType);
    } catch (err) {
      console.warn('[import-ai] OpenAI mapping failed, using fuzzy fallback:', (err as Error).message);
    }
  }

  // Fuzzy fallback — no API key required
  return mapWithFuzzy(headers, entityType);
}

// ── AI mapping (GPT-4o-mini) ────────────────────────────────

async function mapWithOpenAI(headers: string[], entityType: EntityType): Promise<ColumnMapping> {
  const targetFields = entityType === 'contacts'
    ? Object.keys(CONTACT_FIELDS)
    : Object.keys(DEAL_FIELDS);

  const prompt = `You are mapping CSV columns to a CRM schema.
Entity: ${entityType}
Target fields: ${targetFields.join(', ')}

CSV column headers: ${headers.map(h => `"${h}"`).join(', ')}

Return a JSON object mapping each CSV header to its best matching target field.
If no good match, use null. Only output JSON, no explanation.
Example: {"Name": "name", "E-mail": "email", "Phone #": "phone"}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
  const data = await response.json();
  const raw = data.choices[0].message.content;
  const mapping = JSON.parse(raw);

  // Filter out null values
  return Object.fromEntries(
    Object.entries(mapping).filter(([, v]) => v !== null)
  ) as ColumnMapping;
}

// ── Fuzzy fallback ──────────────────────────────────────────

function normalize(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
}

function similarity(a: string, b: string): number {
  const an = normalize(a);
  const bn = normalize(b);
  if (an === bn) return 1;
  if (an.includes(bn) || bn.includes(an)) return 0.9;

  // Word overlap
  const aWords = new Set(an.split(' '));
  const bWords = new Set(bn.split(' '));
  const intersection = [...aWords].filter(w => bWords.has(w)).length;
  const union = new Set([...aWords, ...bWords]).size;
  return union === 0 ? 0 : intersection / union;
}

function mapWithFuzzy(headers: string[], entityType: EntityType): ColumnMapping {
  const fieldMap = entityType === 'contacts' ? CONTACT_FIELDS : DEAL_FIELDS;
  const mapping: ColumnMapping = {};

  for (const header of headers) {
    let bestField = '';
    let bestScore = 0.35; // Minimum threshold to avoid garbage mappings

    for (const [fieldName, aliases] of Object.entries(fieldMap)) {
      for (const alias of aliases) {
        const score = similarity(header, alias);
        if (score > bestScore) {
          bestScore = score;
          bestField = fieldName;
        }
      }
    }

    if (bestField) {
      mapping[header] = bestField;
    }
  }

  return mapping;
}
