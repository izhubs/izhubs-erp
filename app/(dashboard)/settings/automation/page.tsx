'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Zap } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface ActionConfig {
  type: string;
  subject: string;
  daysFromNow: number;
}

interface Automation {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  action_config: ActionConfig;
  is_active: boolean;
}

const TRIGGER_LABELS: Record<string, string> = {
  'deal.stage_changed': 'Deal changes stage',
  'deal.created':       'Deal is created',
  'contact.created':    'Contact is created',
};

const EMPTY_FORM = {
  name: '',
  trigger: 'deal.stage_changed',
  condition: "toStage == 'renewal'",
  action: 'create_activity',
  action_config: { type: 'task', subject: '', daysFromNow: 0 },
  is_active: true,
};

export default function AutomationSettingsPage() {
  const { locale } = useLanguage();
  const isVi = locale === 'vi';

  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Automation | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const apiFetch = useCallback(async (url: string, options?: RequestInit) => {
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    });
    return res.json();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await apiFetch('/api/v1/automations');
    setAutomations(data.data?.automations ?? []);
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
    setError('');
  };

  const openEdit = (a: Automation) => {
    setEditing(a);
    setForm({
      name: a.name,
      trigger: a.trigger,
      condition: a.condition,
      action: a.action,
      action_config: { ...a.action_config },
      is_active: a.is_active,
    });
    setShowForm(true);
    setError('');
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.action_config.subject.trim()) {
      setError(isVi ? 'Tên và tiêu đề task là bắt buộc.' : 'Name and task subject are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await apiFetch(`/api/v1/automations/${editing.id}`, { method: 'PATCH', body: JSON.stringify(form) });
      } else {
        await apiFetch('/api/v1/automations', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowForm(false);
      await load();
    } catch {
      setError(isVi ? 'Có lỗi xảy ra, thử lại.' : 'Failed to save, please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (a: Automation) => {
    await apiFetch(`/api/v1/automations/${a.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: !a.is_active }),
    });
    setAutomations(prev => prev.map(x => x.id === a.id ? { ...x, is_active: !x.is_active } : x));
  };

  const handleDelete = async (a: Automation) => {
    if (!confirm(isVi ? `Xoá automation "${a.name}"?` : `Delete automation "${a.name}"?`)) return;
    await apiFetch(`/api/v1/automations/${a.id}`, { method: 'DELETE' });
    setAutomations(prev => prev.filter(x => x.id !== a.id));
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Zap size={22} style={{ color: 'var(--color-primary)' }} />
          {isVi ? 'Automation Rules' : 'Automation Rules'}
        </h1>
        <button className="btn btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Plus size={16} />
          {isVi ? 'Thêm rule' : 'Add Rule'}
        </button>
      </div>

      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-5)' }}>
        {isVi
          ? 'Các rule tự động tạo task khi deal thay đổi giai đoạn. Có thể bật/tắt, chỉnh sửa bất cứ lúc nào.'
          : 'Rules that automatically create tasks when deal stages change. Toggle or edit at any time.'}
      </p>

      {/* ── Rule List ── */}
      {loading ? (
        <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          {isVi ? 'Đang tải...' : 'Loading...'}
        </div>
      ) : automations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
          <Zap size={32} style={{ opacity: 0.3, marginBottom: 'var(--space-3)' }} />
          <p>{isVi ? 'Chưa có automation rule nào.' : 'No automation rules yet.'}</p>
          <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: 'var(--space-3)' }}>
            {isVi ? 'Tạo rule đầu tiên' : 'Create first rule'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {automations.map((a) => (
            <div
              key={a.id}
              className="card"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)',
                opacity: a.is_active ? 1 : 0.55,
                padding: 'var(--space-4)',
              }}
            >
              {/* Toggle */}
              <button
                onClick={() => handleToggle(a)}
                title={a.is_active ? (isVi ? 'Tắt' : 'Disable') : (isVi ? 'Bật' : 'Enable')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 2, color: a.is_active ? 'var(--color-success)' : 'var(--color-text-muted)' }}
              >
                {a.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              </button>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 4 }}>{a.name}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <span>⚡ {TRIGGER_LABELS[a.trigger] ?? a.trigger}</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span>🔍 <code style={{ fontFamily: 'monospace', fontSize: 11 }}>{a.condition}</code></span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span>📋 {a.action_config.subject}
                    {a.action_config.daysFromNow > 0 && ` (+${a.action_config.daysFromNow}d)`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
                <button className="btn btn-ghost" onClick={() => openEdit(a)} title={isVi ? 'Chỉnh sửa' : 'Edit'} style={{ padding: 'var(--space-1) var(--space-2)' }}>
                  <Pencil size={14} />
                </button>
                <button className="btn btn-ghost" onClick={() => handleDelete(a)} title={isVi ? 'Xoá' : 'Delete'} style={{ padding: 'var(--space-1) var(--space-2)', color: 'var(--color-danger)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit / Create Form Modal ── */}
      {showForm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div className="card" style={{ width: '100%', maxWidth: 520, padding: 'var(--space-6)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: 'var(--space-5)', fontSize: 'var(--font-size-md)' }}>
              {editing ? (isVi ? 'Chỉnh sửa Rule' : 'Edit Rule') : (isVi ? 'Tạo Rule mới' : 'New Rule')}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Name */}
              <label>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-muted)' }}>
                  {isVi ? 'Tên rule' : 'Rule Name'}
                </div>
                <input
                  className="input"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={isVi ? 'VD: Nhắc gia hạn khi chuyển sang Renewal' : 'E.g. Remind renewal when stage changes'}
                  style={{ width: '100%' }}
                />
              </label>

              {/* Trigger */}
              <label>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-muted)' }}>
                  {isVi ? 'Trigger sự kiện' : 'Trigger Event'}
                </div>
                <select className="input" value={form.trigger} onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))} style={{ width: '100%' }}>
                  <option value="deal.stage_changed">Deal changes stage</option>
                  <option value="deal.created">Deal is created</option>
                  <option value="contact.created">Contact is created</option>
                </select>
              </label>

              {/* Condition */}
              <label>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-muted)' }}>
                  {isVi ? 'Điều kiện (stage key)' : 'Condition (stage key)'}
                </div>
                <input
                  className="input"
                  value={form.condition}
                  onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                  placeholder="toStage == 'renewal'"
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: 13 }}
                />
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  {isVi ? "VD: toStage == 'renewal' hoặc true để luôn chạy" : "E.g. toStage == 'renewal' or true to always run"}
                </div>
              </label>

              {/* Task Subject */}
              <label>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-muted)' }}>
                  {isVi ? 'Tiêu đề task tạo ra' : 'Task Subject'}
                </div>
                <input
                  className="input"
                  value={form.action_config.subject}
                  onChange={e => setForm(f => ({ ...f, action_config: { ...f.action_config, subject: e.target.value } }))}
                  placeholder={isVi ? 'Liên hệ gia hạn hợp đồng' : 'Follow-up contract renewal'}
                  style={{ width: '100%' }}
                />
              </label>

              {/* Days From Now */}
              <label>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-muted)' }}>
                  {isVi ? 'Due sau bao nhiêu ngày?' : 'Due in how many days?'}
                </div>
                <input
                  className="input"
                  type="number"
                  min={0}
                  max={365}
                  value={form.action_config.daysFromNow}
                  onChange={e => setForm(f => ({ ...f, action_config: { ...f.action_config, daysFromNow: Number(e.target.value) } }))}
                  style={{ width: 120 }}
                />
                <span style={{ marginLeft: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                  {isVi ? 'ngày' : 'days'}
                </span>
              </label>

              {/* Active */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                <span style={{ fontSize: 'var(--font-size-sm)' }}>
                  {isVi ? 'Kích hoạt ngay' : 'Active'}
                </span>
              </label>

              {error && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>{error}</div>}

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                <button className="btn btn-ghost" onClick={() => setShowForm(false)}>
                  {isVi ? 'Huỷ' : 'Cancel'}
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? (isVi ? 'Đang lưu...' : 'Saving...') : (isVi ? 'Lưu' : 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
