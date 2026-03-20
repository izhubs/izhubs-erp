'use client';

import { useState } from 'react';
import { IzButton } from '@/components/ui/IzButton';
import { IzCard, IzCardContent } from '@/components/ui/IzCard';
import { IzSwitch } from '@/components/ui/IzSwitch';

interface Props {
  onSelect: (templateId: string, includeDemoData: boolean) => void;
}

export default function IndustrySelector({ onSelect }: Props) {
  const [selected, setSelected] = useState<string>('agency');
  const [demoData, setDemoData] = useState(true);

  const templates = [
    { id: 'agency', name: 'Agency / Dịch vụ', desc: 'Quản lý dự án, retainer, resource...' },
    { id: 'freelancer', name: 'Freelancer', desc: 'Sắp xếp công việc, invoice cá nhân' },
    { id: 'virtual-office', name: 'Virtual Office / Văn phòng ảo', desc: 'Quản lý không gian, dịch vụ thêm' }
  ];

  return (
    <div style={{ maxWidth: 600, margin: '5vh auto', padding: 'var(--space-4)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          Chọn Mô hình Kinh doanh
        </h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Hệ thống sẽ tự động cấu hình quy trình làm việc phù hợp nhất.
        </p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {templates.map(t => (
          <IzCard 
            key={t.id} 
            style={{ 
              cursor: 'pointer', 
              border: selected === t.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              transition: 'all 0.2s ease',
              backgroundColor: selected === t.id ? 'var(--color-primary-light)' : 'var(--color-bg)'
            }}
            onClick={() => setSelected(t.id)}
          >
            <IzCardContent style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ 
                width: 24, 
                height: 24, 
                borderRadius: '50%', 
                border: selected === t.id ? '6px solid var(--color-primary)' : '2px solid var(--color-border)',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }} />
              <div>
                <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)', marginBottom: '4px' }}>{t.name}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{t.desc}</p>
              </div>
            </IzCardContent>
          </IzCard>
        ))}
      </div>

      <IzCard style={{ marginTop: 'var(--space-6)', backgroundColor: 'var(--color-bg-subtle)' }}>
        <IzCardContent style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Dữ Liệu Mẫu (Demo Data)</h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', maxWidth: 350 }}>
              Gồm khách hàng & Deals mẫu để trải nghiệm. Có thể xoá sạch bất kỳ lúc nào.
            </p>
          </div>
          <IzSwitch checked={demoData} onChange={(e) => setDemoData(e.target.checked)} />
        </IzCardContent>
      </IzCard>

      <IzButton 
        variant="default" 
        size="lg"
        style={{ width: '100%', marginTop: 'var(--space-6)', padding: 'var(--space-3)' }}
        onClick={() => onSelect(selected, demoData)}
      >
        Tiếp tục & Cấp phát Hệ thống
      </IzButton>
    </div>
  );
}
