'use client';

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { SmartGrid, EditableCell } from '@izerp-theme/components/ui/SmartGrid';
import { ColumnDef } from '@tanstack/react-table';
import { IzButton } from '@izerp-theme/components/ui/IzButton';

type EntityType = 'contacts' | 'deals';
type Step = 'upload' | 'mapping' | 'preview' | 'result';

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

  // ── Step 2 and 3: Confirm mapping and Preview ───────────────

  const handleUpdateData = (rowIndex: number, columnId: string, value: unknown) => {
    setAllRows(old =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value as string,
          };
        }
        return row;
      })
    );
  };

  const previewColumns = useMemo<ColumnDef<any>[]>(() => {
    if (!mapping) return [];
    const activeHeaders = Object.keys(mapping).filter(k => mapping[k] && mapping[k] !== '(skip)');
    return activeHeaders.map(csvHeader => ({
      id: csvHeader,
      accessorKey: csvHeader,
      header: mapping[csvHeader], 
      cell: (ctx) => <EditableCell context={ctx} />,
    }));
  }, [mapping]);

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
    <div className="page-header" style={{ maxWidth: step === 'preview' ? '100%' : 760, margin: '0 auto', transition: 'max-width 0.3s' }}>
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
              <IzButton
                key={t}
                variant={entityType === t ? 'default' : 'ghost'}
                onClick={() => setEntityType(t)}
                style={{ textTransform: 'capitalize' }}
              >
                {t}
              </IzButton>
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
        <div className="card" style={{ background: '#0f1117', color: '#fff', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>Step 2 — Map Columns</h2>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>
            AI đã tự động map các cột. Kéo thẻ CSV để điều chỉnh mapping.
          </p>

          {/* TARGET SLOTS (System Fields) */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>📌 Trường hệ thống (izhubs)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
              {fieldOptions.filter(f => f !== '(skip)').map(sysField => {
                const mappedCsvCols = proposal.headers.filter(h => mapping[h] === sysField);
                const hasMapping = mappedCsvCols.length > 0;

                return (
                  <div
                    key={sysField}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedCol = e.dataTransfer.getData('text/plain');
                      if (draggedCol) {
                        setMapping(prev => ({ ...prev, [draggedCol]: sysField }));
                      }
                    }}
                    style={{
                      border: hasMapping ? '1px solid #7c3aed' : '1px dashed #3a3d52',
                      background: hasMapping ? '#7c3aed' : 'transparent',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-3)',
                      minHeight: 80,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 'var(--font-size-xs)', color: hasMapping ? '#e9d5ff' : 'var(--color-text-muted)', marginBottom: 'var(--space-1)', textTransform: 'capitalize' }}>
                      {sysField}
                    </div>
                    {hasMapping ? (
                      mappedCsvCols.map(col => (
                        <div key={col} style={{ fontWeight: 600, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col}</span>
                          <button 
                            onClick={() => setMapping(prev => ({ ...prev, [col]: '(skip)' }))}
                            style={{ background: 'none', border: 'none', color: '#e9d5ff', cursor: 'pointer', fontSize: 16 }}
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: '#3a3d52', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>+ Thả vào đây</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CSV TRAY */}
          <div style={{ background: '#161929', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid #2a2d3e' }}>
            <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>📄 Cột từ file contacts.csv</h3>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const draggedCol = e.dataTransfer.getData('text/plain');
                if (draggedCol) {
                  setMapping(prev => ({ ...prev, [draggedCol]: '(skip)' }));
                }
              }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', minHeight: 60 }}
            >
              {proposal.headers.map(col => {
                const isMapped = mapping[col] && mapping[col] !== '(skip)';
                return (
                  <div
                    key={col}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', col);
                    }}
                    style={{
                      border: '1px solid',
                      borderColor: isMapped ? '#2a2d3e' : '#3b82f6',
                      background: '#1a1d2e',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-2) var(--space-3)',
                      opacity: isMapped ? 0.6 : 1,
                      cursor: 'grab',
                      userSelect: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      minWidth: 140,
                      maxWidth: 200,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col}</span>
                      {!isMapped && <span style={{ background: '#eab308', color: '#713f12', fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>⚠️ Chưa map</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Mẫu: {proposal.sample[0]?.[col] ?? '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IzButton variant="ghost" onClick={() => setStep('upload')} style={{ color: '#fff' }}>← Quay lại</IzButton>
            <div style={{ textAlign: 'center' }}>
              <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                {proposal.totalRows} dòng từ file CSV
              </span>
            </div>
            <IzButton variant="default" onClick={() => setStep('preview')} disabled={loading} style={{ background: '#7c3aed', color: '#fff', border: 'none' }}>
              Xem trước dữ liệu →
            </IzButton>
          </div>
        </div>
      )}

      {/* ── Step 3: Preview ── */}
      {step === 'preview' && proposal && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>Step 3 — Review Data</h2>
              <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                Bạn có thể edit trực tiếp vào bảng dưới đây trước khi Import.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <IzButton variant="ghost" onClick={() => setStep('mapping')}>← Cột</IzButton>
              <IzButton variant="default" onClick={handleConfirm} disabled={loading} style={{ background: '#7c3aed', color: '#fff', border: 'none' }}>
                {loading ? 'Đang xử lý…' : `Import ${allRows.length} dòng`}
              </IzButton>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <SmartGrid
              data={allRows}
              columns={previewColumns}
              updateData={handleUpdateData}
            />
          </div>
        </div>
      )}

      {/* ── Step 4: Result ── */}
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
          <IzButton variant="default" onClick={() => router.push(entityType === 'contacts' ? '/contacts/sheet' : '/deals/sheet')}>
            Xem dữ liệu trên Sheet →
          </IzButton>
        </div>
      )}
    </div>
  );
}
