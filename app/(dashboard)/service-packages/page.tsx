'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Package, Pencil, Trash2, Users, DollarSign, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { IzButton } from '@/components/ui/IzButton';
import { IzInput } from '@/components/ui/IzInput';
import { IzSelect } from '@/components/ui/IzSelect';
import { IzCheckbox } from '@/components/ui/IzCheckbox';

interface ServicePackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billing: 'monthly' | 'yearly' | 'one_time';
  is_active: boolean;
  subscriber_count: number;
}

const BILLING_LABELS: Record<string, string> = {
  monthly:  'Monthly',
  yearly:   'Yearly',
  one_time: 'One-time',
};

const BILLING_LABELS_VI: Record<string, string> = {
  monthly:  'Hàng tháng',
  yearly:   'Hàng năm',
  one_time: 'Một lần',
};

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(price);
}

type BillingCycle = 'monthly' | 'yearly' | 'one_time';

const EMPTY_FORM: {
  name: string; description: string; price: number;
  currency: string; billing: BillingCycle; is_active: boolean;
} = {
  name: '', description: '', price: 0, currency: 'VND', billing: 'monthly', is_active: true,
};

export default function ServicePackagesPage() {
  const { locale } = useLanguage();
  const isVi = locale === 'vi';

  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [selected, setSelected] = useState<ServicePackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<ServicePackage | null>(null);
  const [form, setForm] = useState<{ name: string; description: string; price: number; currency: string; billing: BillingCycle; is_active: boolean; }>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/v1/service-packages');
    const data = await res.json();
    const pkgs: ServicePackage[] = data.data?.packages ?? [];
    setPackages(pkgs);
    if (!selected && pkgs.length > 0) setSelected(pkgs[0]);
    setLoading(false);
  }, [selected]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (p: ServicePackage) => {
    setEditTarget(p);
    setForm({ name: p.name, description: p.description ?? '', price: p.price, currency: p.currency, billing: p.billing, is_active: p.is_active });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const url = editTarget ? `/api/v1/service-packages/${editTarget.id}` : '/api/v1/service-packages';
    const method = editTarget ? 'PATCH' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setSaving(false);
    await load();
  };

  const handleDelete = async (p: ServicePackage) => {
    if (!confirm(isVi ? `Xoá gói "${p.name}"?` : `Delete package "${p.name}"?`)) return;
    await fetch(`/api/v1/service-packages/${p.id}`, { method: 'DELETE' });
    if (selected?.id === p.id) setSelected(null);
    await load();
  };

  const filtered = packages.filter(p => activeTab === 'active' ? p.is_active : !p.is_active);

  return (
    <div>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Package size={22} style={{ color: 'var(--color-primary)' }} />
          {isVi ? 'Gói Dịch vụ' : 'Service Packages'}
        </h1>
        <IzButton variant="default" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Plus size={16} />
          {isVi ? 'Tạo gói mới' : 'New Package'}
        </IzButton>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 0 }}>
        {[
          { key: 'active',   labelEn: 'Active',   labelVi: 'Đang bán' },
          { key: 'inactive', labelEn: 'Inactive',  labelVi: 'Không hoạt động' },
        ].map(tab => (
          <IzButton
            variant="ghost"
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'active' | 'inactive')}
            style={{
              borderBottom: `2px solid ${activeTab === tab.key ? 'var(--color-primary)' : 'transparent'}`,
              borderRadius: 0,
              padding: 'var(--space-2) var(--space-3)',
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
            }}
          >
            {isVi ? tab.labelVi : tab.labelEn}
            <span style={{
              marginLeft: 'var(--space-2)', background: 'var(--color-bg-elevated)',
              borderRadius: 'var(--radius-full)', padding: '0 6px', fontSize: 11,
            }}>
              {packages.filter(p => tab.key === 'active' ? p.is_active : !p.is_active).length}
            </span>
          </IzButton>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--space-5)', alignItems: 'start' }}>
        {/* ── Left: Package List ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {loading ? (
            <div style={{ color: 'var(--color-text-muted)', padding: 'var(--space-4)', textAlign: 'center' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
              <Package size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ fontSize: 'var(--font-size-sm)' }}>{isVi ? 'Chưa có gói nào.' : 'No packages yet.'}</p>
            </div>
          ) : filtered.map(pkg => (
            <div
              key={pkg.id}
              className="card"
              onClick={() => setSelected(pkg)}
              style={{
                cursor: 'pointer',
                border: `2px solid ${selected?.id === pkg.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                padding: 'var(--space-4)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 4 }}>{pkg.name}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>
                    {formatPrice(pkg.price, pkg.currency)} / {isVi ? BILLING_LABELS_VI[pkg.billing] : BILLING_LABELS[pkg.billing]}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  <Users size={12} />
                  {pkg.subscriber_count}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Right: Package Detail ── */}
        {selected ? (
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-5)' }}>
              <div>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 4 }}>{selected.name}</h2>
                <span style={{
                  display: 'inline-block', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)', padding: '1px 10px',
                  fontSize: 11, color: selected.is_active ? 'var(--color-success)' : 'var(--color-text-muted)',
                }}>
                  {selected.is_active ? (isVi ? 'Đang bán' : 'Active') : (isVi ? 'Không hoạt động' : 'Inactive')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <IzButton variant="ghost" onClick={() => openEdit(selected)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Pencil size={14} /> {isVi ? 'Sửa' : 'Edit'}
                </IzButton>
                <IzButton variant="ghost" onClick={() => handleDelete(selected)} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-danger)' }}>
                  <Trash2 size={14} /> {isVi ? 'Xoá' : 'Delete'}
                </IzButton>
              </div>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', gap: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
              {[
                { icon: DollarSign, labelEn: 'Price', labelVi: 'Giá', value: formatPrice(selected.price, selected.currency) },
                { icon: Users, labelEn: 'Subscribers', labelVi: 'Khách hàng', value: String(selected.subscriber_count) },
              ].map((stat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <stat.icon size={16} style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {isVi ? stat.labelVi : stat.labelEn}
                    </div>
                    <div style={{ fontWeight: 700 }}>{stat.value}</div>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {isVi ? 'Chu kỳ' : 'Billing'}
                  </div>
                  <div style={{ fontWeight: 700 }}>{isVi ? BILLING_LABELS_VI[selected.billing] : BILLING_LABELS[selected.billing]}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            {selected.description && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h4 style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isVi ? 'Mô tả' : 'Description'}
                </h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{selected.description}</p>
              </div>
            )}

            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
              {isVi ? 'Chỉnh sửa gói để thêm tính năng chi tiết.' : 'Edit the package to add feature details.'}
            </p>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: 'var(--color-text-muted) ' }}>
            <div style={{ textAlign: 'center' }}>
              <Package size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ fontSize: 'var(--font-size-sm)' }}>{isVi ? 'Chọn một gói để xem chi tiết' : 'Select a package to view details'}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {showForm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div className="card" style={{ width: '100%', maxWidth: 480, padding: 'var(--space-6)' }}>
            <h2 style={{ marginBottom: 'var(--space-5)', fontSize: 'var(--font-size-md)' }}>
              {editTarget ? (isVi ? 'Chỉnh sửa gói' : 'Edit Package') : (isVi ? 'Tạo gói mới' : 'New Package')}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[
                { key: 'name', labelEn: 'Package Name', labelVi: 'Tên gói', type: 'text', placeholder: 'Basic / Pro / Enterprise' },
                { key: 'description', labelEn: 'Description', labelVi: 'Mô tả', type: 'text', placeholder: '' },
              ].map(f => (
                <label key={f.key}>
                  <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: 4, color: 'var(--color-text-muted)' }}>
                    {isVi ? f.labelVi : f.labelEn}
                  </div>
                  <IzInput
                    value={(form as Record<string, unknown>)[f.key] as string}
                    onChange={(e: any) => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                  />
                </label>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <label>
                  <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: 4, color: 'var(--color-text-muted)' }}>
                    {isVi ? 'Giá' : 'Price'}
                  </div>
                  <IzInput type="number" min={0} value={form.price} onChange={(e: any) => setForm(p => ({ ...p, price: Number(e.target.value) }))} />
                </label>
                <label>
                  <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: 4, color: 'var(--color-text-muted)' }}>
                    {isVi ? 'Chu kỳ' : 'Billing'}
                  </div>
                  <IzSelect
                    value={{ label: isVi ? BILLING_LABELS_VI[form.billing] : BILLING_LABELS[form.billing], value: form.billing }}
                    onChange={(selected: any) => setForm(p => ({ ...p, billing: selected.value as BillingCycle }))}
                    options={[
                      { value: "monthly", label: isVi ? 'Hàng tháng' : 'Monthly' },
                      { value: "yearly", label: isVi ? 'Hàng năm' : 'Yearly' },
                      { value: "one_time", label: isVi ? 'Một lần' : 'One-time' }
                    ]}
                  />
                </label>
              </div>

              <IzCheckbox
                checked={form.is_active}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, is_active: e.target.checked }))}
                label={isVi ? 'Đang bán' : 'Active'}
              />

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <IzButton variant="ghost" onClick={() => setShowForm(false)}>{isVi ? 'Huỷ' : 'Cancel'}</IzButton>
                <IzButton variant="default" onClick={handleSave} disabled={saving}>
                  {saving ? '…' : (isVi ? 'Lưu' : 'Save')}
                </IzButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
