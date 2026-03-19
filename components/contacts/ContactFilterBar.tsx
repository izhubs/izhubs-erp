'use client';

// =============================================================
// A3: Filter Bar — extracted from ContactsTable (Rule #8: <150 lines)
// =============================================================

import Link from 'next/link';
import styles from './contacts.module.scss';

interface Props {
  search: string;
  onSearch: (q: string) => void;
  total: number;
  loading: boolean;
  onAdd: () => void;
}

export default function ContactFilterBar({ search, onSearch, total, loading, onAdd }: Props) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>⌕</span>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search contacts…"
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>
      <div className={styles.toolbarRight}>
        <span className={styles.count}>
          {loading ? '…' : `${total} contact${total !== 1 ? 's' : ''}`}
        </span>
        <Link href="/contacts/sheet" className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-sm)' }}>
          📊 Sheet View
        </Link>
        <button className="btn btn-primary" onClick={onAdd}>
          + Add Contact
        </button>
      </div>
    </div>
  );
}
