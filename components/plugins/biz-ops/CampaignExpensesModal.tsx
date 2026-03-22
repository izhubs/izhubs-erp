'use client';

import { useState, useEffect } from 'react';
import { IzButton } from '@/components/ui/IzButton';
import { X, Plus, Trash2 } from 'lucide-react';
import styles from './BizOpsProjects.module.scss';
import { useCurrency } from '@/hooks/useCurrency';

interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
  status: 'pending' | 'paid';
  notes: string | null;
}

interface Props {
  campaignId: string;
  campaignName: string;
  onClose: () => void;
}

export function CampaignExpensesModal({ campaignId, campaignName, onClose }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { formatMoney } = useCurrency();

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('general');
  const [status, setStatus] = useState<'pending' | 'paid'>('paid');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [campaignId]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/biz-ops/campaigns/${campaignId}/expenses`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to fetch expenses');
      setExpenses(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/v1/biz-ops/campaigns/${campaignId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          category,
          status,
          date,
          notes: notes || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to add expense');
      
      setExpenses([json.data, ...expenses]);
      setAmount('');
      setNotes('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await fetch(`/api/v1/biz-ops/campaigns/${campaignId}/expenses/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to delete');
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const totalPaid = expenses.filter(e => e.status === 'paid').reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
        <div className={styles.modalHeader}>
          <h3>Expenses: {campaignName}</h3>
          <button type="button" onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>

        <div className={styles.modalBody} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Paid COGS</h4>
            <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {formatMoney(totalPaid)}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              This value automatically rolls up into the campaign's actual cost. Reload the page to see changes applied.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>Add New Expense</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className={styles.formGroup}>
                <label>Amount</label>
                <input type="number" required min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
              </div>
              <div className={styles.formGroup}>
                <label>Date</label>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className={styles.formGroup}>
                <label>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="general">General</option>
                  <option value="software">Software & Licenses</option>
                  <option value="ads">Advertising</option>
                  <option value="travel">Travel</option>
                  <option value="contractor">Contractor</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as any)}>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Notes (Optional)</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="What was this for?" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IzButton type="submit" variant="primary" disabled={isSubmitting}>
                <Plus size={16} style={{ marginRight: 8 }} />
                Add Expense
              </IzButton>
            </div>
          </form>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>Expense History</h4>
            {loading ? (
              <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            ) : error ? (
              <p style={{ color: 'var(--danger-color)' }}>{error}</p>
            ) : expenses.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '14px' }}>No expenses recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {expenses.map(exp => (
                  <div key={exp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{formatMoney(exp.amount)}</span>
                        <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: exp.status === 'paid' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)', color: exp.status === 'paid' ? 'var(--success-color)' : 'var(--warning-color)' }}>
                          {exp.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{new Date(exp.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span style={{ textTransform: 'capitalize' }}>{exp.category}</span>
                        {exp.notes && (
                          <>
                            <span>•</span>
                            <span>{exp.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(exp.id)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
