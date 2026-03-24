'use client';

// =============================================================
// A3: Filter Bar — extracted from ContactsTable (Rule #8: <150 lines)
// =============================================================

import { useRouter } from 'next/navigation';
import styles from './contacts.module.scss';
import { IzInput } from '@izerp-theme/components/ui/IzInput';
import { IzButton } from '@izerp-theme/components/ui/IzButton';

interface Props {
  search: string;
  onSearch: (q: string) => void;
  total: number;
  loading: boolean;
  onAdd: () => void;
}

export default function ContactFilterBar({ search, onSearch, total, loading, onAdd }: Props) {
  const router = useRouter();

  return (
    <div className={styles.toolbar}>
      <div className={styles.searchWrap}>
        <IzInput
          type="search"
          placeholder="Search contacts…"
          value={search}
          onChange={(e: { target: { value: string } }) => onSearch(e.target.value)}
          leftIcon={<span style={{ color: 'var(--color-text-muted)', fontSize: '18px' }}>⌕</span>}
        />
      </div>
      <div className={styles.toolbarRight}>
        <span className={styles.count}>
          {loading ? '…' : `${total} contact${total !== 1 ? 's' : ''}`}
        </span>
        <IzButton variant="ghost" onClick={() => router.push('/contacts/sheet')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-sm)' }}>
          Bulk Edit
        </IzButton>
        <IzButton id="btn-add-contact" variant="default" onClick={onAdd}>
          + Add Contact
        </IzButton>
      </div>
    </div>
  );
}
