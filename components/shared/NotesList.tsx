'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Note } from '@/core/engine/notes';
import { apiFetch } from '@/lib/apiFetch';
import styles from './shared.module.scss';

interface Props {
  entityType: 'contact' | 'deal' | 'company';
  entityId: string;
}

export default function NotesList({ entityType, entityId }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch(`/api/v1/notes?entity_type=${entityType}&entity_id=${entityId}`)
      .then(r => r.json())
      .then(json => { if (!cancelled) setNotes(json.data ?? []); })
      .catch(() => { if (!cancelled) setNotes([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [entityType, entityId]);

  const handleAdd = useCallback(async () => {
    if (!newNote.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/v1/notes', {
        method: 'POST',
        body: JSON.stringify({ entityType, entityId, content: newNote.trim() }),
      });
      const json = await res.json();
      if (res.ok) { setNotes(prev => [json.data, ...prev]); setNewNote(''); }
    } finally {
      setSubmitting(false);
    }
  }, [entityType, entityId, newNote, submitting]);

  const handleDelete = useCallback(async (id: string) => {
    await apiFetch(`/api/v1/notes/${id}`, { method: 'DELETE' });
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <div className={styles.notesSection}>
      <span className={styles.notesSectionLabel}>Notes</span>

      <div className={styles.notesAddRow}>
        <textarea
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          placeholder="Add a note…"
          rows={2}
          className={`form-control ${styles.notesTextarea}`}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd(); }}
        />
        <button className={`btn btn-primary ${styles.notesAddBtn}`} onClick={handleAdd} disabled={!newNote.trim() || submitting}>
          {submitting ? '…' : 'Add'}
        </button>
      </div>

      {loading ? (
        <span className={styles.notesEmpty}>Loading…</span>
      ) : notes.length === 0 ? (
        <span className={styles.notesEmpty}>No notes yet. Add one!</span>
      ) : (
        <div className={styles.notesList}>
          {notes.map(note => (
            <div key={note.id} className={styles.noteItem}>
              <div className={styles.noteItemMeta}>
                <span>{timeAgo(new Date(note.createdAt))}</span>
                <button className={styles.noteDeleteBtn} onClick={() => handleDelete(note.id)} title="Delete note">✕</button>
              </div>
              <p className={styles.noteContent}>{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 30) return `${d}d ago`;
  return date.toLocaleDateString();
}
