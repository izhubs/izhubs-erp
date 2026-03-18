'use client';

// =============================================================
// CommandPalette — Global Ctrl+K command palette
// Linear/Notion-style. Search contacts + deals + navigate.
// Rule: component < 150 lines → split into sections below.
// =============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { NavItem } from '@/templates/engine/template.schema';
import { apiFetch } from '@/lib/apiFetch';
import styles from './CommandPalette.module.scss';

// ---- Types ----
interface SearchResult {
  contacts: Array<{ id: string; name: string; email?: string; title?: string }>;
  deals: Array<{ id: string; title: string; stage?: string; value?: number }>;
}

interface Action {
  id: string;
  label: string;
  icon: string;
  sub?: string;
  href?: string;
  action?: () => void;
  kbd?: string;
}

interface Props {
  navItems: NavItem[];
  open: boolean;
  onClose: () => void;
}

// ---- Main Component ----
export default function CommandPalette({ navItems, open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({ contacts: [], deals: [] });
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults({ contacts: [], deals: [] });
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults({ contacts: [], deals: [] }); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.data ?? { contacts: [], deals: [] });
      } catch {
        setResults({ contacts: [], deals: [] });
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Build action list (nav pages)
  const navActions: Action[] = navItems.map(item => ({
    id: item.id,
    label: `Go to ${item.label}`,
    icon: '→',
    sub: item.href,
    href: item.href,
  }));

  // All items flat list for keyboard nav
  const allItems: Action[] = [
    ...(!query ? navActions : []),
    ...results.contacts.map(c => ({ id: `c-${c.id}`, label: c.name, icon: '👤', sub: c.email ?? c.title ?? 'Contact', href: `/contacts?open=${c.id}` })),
    ...results.deals.map(d => ({ id: `d-${d.id}`, label: d.title, icon: '💼', sub: d.stage ?? 'Deal', href: `/deals?open=${d.id}` })),
  ];

  const go = useCallback((item: Action) => {
    if (item.action) { item.action(); }
    else if (item.href) { router.push(item.href); }
    onClose();
  }, [router, onClose]);

  // Keyboard handler
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, allItems.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      else if (e.key === 'Enter') { e.preventDefault(); if (allItems[activeIdx]) go(allItems[activeIdx]); }
      else if (e.key === 'Escape') { onClose(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, allItems, activeIdx, go, onClose]);

  // Reset active idx on query change
  useEffect(() => setActiveIdx(0), [query]);

  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.panel} role="dialog" aria-label="Command palette">

        {/* Search input */}
        <div className={styles.searchRow}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            ref={inputRef}
            className={styles.searchInput}
            placeholder="Search contacts, deals, or navigate…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          {loading && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>…</span>}
        </div>

        {/* Results */}
        <div className={styles.results}>
          {allItems.length === 0 && query.length > 1 && !loading && (
            <div className={styles.empty}>No results for "{query}"</div>
          )}
          {!query && (
            <div className={styles.section}>
              <span className={styles.sectionTitle}>Navigate</span>
            </div>
          )}
          {results.contacts.length > 0 && (
            <div className={styles.section}><span className={styles.sectionTitle}>Contacts</span></div>
          )}
          {results.deals.length > 0 && query && (
            <div className={styles.section}><span className={styles.sectionTitle}>Deals</span></div>
          )}
          {allItems.map((item, idx) => (
            <div
              key={item.id}
              className={`${styles.item}${idx === activeIdx ? ` ${styles.itemActive}` : ''}`}
              onClick={() => go(item)}
              onMouseEnter={() => setActiveIdx(idx)}
            >
              <div className={styles.itemIcon}>{item.icon}</div>
              <div className={styles.itemContent}>
                <div className={styles.itemLabel}>{item.label}</div>
                {item.sub && <div className={styles.itemSub}>{item.sub}</div>}
              </div>
              {item.kbd && <kbd className={styles.itemKbd}>{item.kbd}</kbd>}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.footerHint}><kbd>↑↓</kbd> navigate</span>
          <span className={styles.footerHint}><kbd>↵</kbd> open</span>
          <span className={styles.footerHint}><kbd>Esc</kbd> close</span>
        </div>
      </div>
    </>
  );
}
