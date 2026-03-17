'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, ArrowRight, Check, AlertCircle } from 'lucide-react';

type EntityType = 'contacts' | 'deals';
type Step = 'upload' | 'mapping' | 'result';

interface MappingProposal {
  jobId: string;
  mapping: Record<string, string>;
  sample: Record<string, string>[];
  headers: string[];
  totalRows: number;
}

interface ImportResult {
  imported: number;
  failed: number;
  errors: string[];
}

// Fields available for each entity type
const CONTACT_FIELDS = ['name', 'email', 'phone', 'title', 'company', '(skip)'];
const DEAL_FIELDS    = ['name', 'value', 'stage', 'contact', '(skip)'];

export default function ImportPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [entityType, setEntityType] = useState<EntityType>('contacts');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<MappingProposal | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ImportResult | null>(null);
  const [allRows, setAllRows] = useState<Record<string, string>[]>([]);

  // ── Step 1: Upload ──────────────────────────────────────────

  async function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) { setError('Only .csv files are supported'); return; }
    setError(null);
    setLoading(true);

    // Parse CSV on client too so we can send all rows on confirm
    const { default: Papa } = await import('papaparse');
    const parsed = await new Promise<any>((resolve) => {
      Papa.parse(file, { header: true, skipEmptyLines: true, complete: resolve });
    });
    setAllRows(parsed.data);

    const form = new FormData();
    form.append('file', file);
    form.append('entityType', entityType);

    try {
      const res = await fetch('/api/v1/import', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? 'Upload failed');

      setProposal(json.data);
      setMapping({ ...json.data.mapping });
      setStep('mapping');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Confirm mapping ─────────────────────────────────

  async function handleConfirm() {
    if (!proposal) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/import/${proposal.jobId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mapping, rows: allRows }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? 'Import failed');
      setResult(json.data);
      setStep('result');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const fieldOptions = entityType === 'contacts' ? CONTACT_FIELDS : DEAL_FIELDS;

  return (
    <div className="page-header" style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header__top" style={{ marginBottom: 'var(--space-8)' }}>
        <h1 className="page-header__title">Import Data</h1>
        <p className="text-muted">Import contacts or deals from a CSV exported from Airtable, Notion, or Excel.</p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-8)', alignItems: 'center' }}>
        {(['upload', 'mapping', 'result'] as Step[]).map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'var(--font-size-xs)', fontWeight: 700,
              background: step === s ? 'var(--color-primary)' : (
                ['upload','mapping','result'].indexOf(step) > i ? 'var(--color-success, #22c55e)' : 'var(--color-bg-hover)'
              ),
              color: step === s || ['upload','mapping','result'].indexOf(step) > i ? '#fff' : 'var(--color-text-muted)',
            }}>
              {['upload','mapping','result'].indexOf(step) > i ? <Check size={12} /> : i + 1}
            </div>
            <span style={{ fontSize: 'var(--font-size-sm)', textTransform: 'capitalize', color: step === s ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{s}</span>
            {i < 2 && <div style={{ width: 32, height: 1, background: 'var(--color-border)' }} />}
          </div>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="card" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', marginBottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ── Step 1: Upload ── */}
      {step === 'upload' && (
        <div className="card">
          {/* Entity type selector */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
            {(['contacts', 'deals'] as EntityType[]).map(t => (
              <button
                key={t}
                className={`btn ${entityType === t ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setEntityType(t)}
                style={{ textTransform: 'capitalize' }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            style={{
              border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-12) var(--space-6)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
              background: isDragging ? 'var(--color-bg-hover)' : 'transparent',
            }}
          >
            <Upload size={40} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }} />
            <p style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>Drop your CSV here</p>
            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>or click to browse — max 5 MB</p>
            {loading && <p style={{ marginTop: 'var(--space-3)', color: 'var(--color-primary)' }}>Analyzing…</p>}
          </div>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-4)' }}>
            💡 Works with exports from Airtable, Notion, Google Sheets, and HubSpot.
          </p>
        </div>
      )}

      {/* ── Step 2: Mapping ── */}
      {step === 'mapping' && proposal && (
        <div className="card">
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>Review column mapping</h2>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>
            AI mapped your CSV columns automatically. Adjust any incorrect mappings below.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-muted)', fontWeight: 600 }}>CSV Column</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-muted)', fontWeight: 600 }}>Sample Value</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-muted)', fontWeight: 600 }}>Maps to</th>
              </tr>
            </thead>
            <tbody>
              {proposal.headers.map(col => (
                <tr key={col} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-2) var(--space-3)', fontWeight: 500 }}>{col}</td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-muted)' }}>
                    {proposal.sample[0]?.[col] ?? '—'}
                  </td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                    <select
                      className="input"
                      style={{ padding: 'var(--space-1) var(--space-2)', height: 'auto' }}
                      value={mapping[col] ?? '(skip)'}
                      onChange={(e) => setMapping(m => ({ ...m, [col]: e.target.value }))}
                    >
                      {fieldOptions.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>{proposal.totalRows} rows to import</p>
            <button className="btn btn-primary" onClick={handleConfirm} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {loading ? 'Importing…' : <><span>Import {proposal.totalRows} rows</span><ArrowRight size={16} /></>}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Result ── */}
      {step === 'result' && result && (
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🎉</div>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Import complete</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-8)', margin: 'var(--space-6) 0' }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-primary)' }}>{result.imported}</div>
              <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>imported</div>
            </div>
            {result.failed > 0 && (
              <div>
                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-danger)' }}>{result.failed}</div>
                <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>skipped</div>
              </div>
            )}
          </div>
          {result.errors.length > 0 && (
            <div style={{ textAlign: 'left', background: 'var(--color-bg-hover)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              {result.errors.slice(0, 5).map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}
          <button className="btn btn-primary" onClick={() => router.push(entityType === 'contacts' ? '/contacts' : '/pipeline')}>
            View {entityType} →
          </button>
        </div>
      )}
    </div>
  );
}
