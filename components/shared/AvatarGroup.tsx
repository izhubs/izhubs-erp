// =============================================================
// izhubs ERP — AvatarGroup
// Overlapping avatar stack: up to maxVisible shown, rest as "+N".
// Used on deal cards (owners), contact lists, task rows.
// =============================================================

import React from 'react';

export interface Avatar {
  /** Unique identifier */
  id: string;
  /** Display name (used for title tooltip + initials fallback) */
  name: string;
  /** Avatar image URL — falls back to initials if undefined */
  imageUrl?: string;
}

interface AvatarGroupProps {
  avatars: Avatar[];
  maxVisible?: number;
  /** Size in px */
  size?: number;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#22c55e', '#14b8a6', '#3b82f6', '#ef4444',
];

function getColor(id: string) {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COLORS[sum % COLORS.length];
}

export default function AvatarGroup({
  avatars,
  maxVisible = 4,
  size = 28,
}: AvatarGroupProps) {
  const visible = avatars.slice(0, maxVisible);
  const overflow = avatars.length - maxVisible;

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    border: '2px solid var(--color-bg-surface)',
    marginLeft: visible.indexOf(visible[0]) === 0 ? 0 : -size * 0.35,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.35,
    fontWeight: 600,
    color: '#fff',
    flexShrink: 0,
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((avatar, idx) => (
        <div
          key={avatar.id}
          title={avatar.name}
          style={{
            ...baseStyle,
            marginLeft: idx === 0 ? 0 : -size * 0.35,
            background: avatar.imageUrl ? 'transparent' : getColor(avatar.id),
            overflow: 'hidden',
          }}
        >
          {avatar.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar.imageUrl} alt={avatar.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            getInitials(avatar.name)
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{
            ...baseStyle,
            marginLeft: -size * 0.35,
            background: 'var(--color-bg-hover)',
            color: 'var(--color-text-muted)',
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
