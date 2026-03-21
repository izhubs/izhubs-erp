'use client';

import { useState, useEffect } from 'react';
import { Eye, ShieldAlert, Check } from 'lucide-react';
import {
  IzDropdownMenu,
  IzDropdownMenuTrigger,
  IzDropdownMenuContent,
  IzDropdownMenuItem,
  IzDropdownMenuLabel,
  IzDropdownMenuSeparator,
} from '@/components/ui/IzDropdownMenu';
import { IzButton } from '@/components/ui/IzButton';
import { useToast } from '@/lib/toast';

const ROLES = [
  { id: 'superadmin', label: 'SuperAdmin' },
  { id: 'admin', label: 'Admin' },
  { id: 'manager', label: 'Manager' },
  { id: 'member', label: 'Member' },
  { id: 'viewer', label: 'Viewer' },
];

export function ViewAsRoleSelector() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentViewRole, setCurrentViewRole] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    try {
      // 1. Check if user is SuperAdmin by parsing JWT
      const tokenStr = document.cookie
        .split('; ')
        .find(r => r.startsWith('hz_access='))
        ?.split('=')[1];
      
      if (!tokenStr) return;
      const payload = JSON.parse(atob(tokenStr.split('.')[1]));
      
      if (payload.role === 'superadmin') {
        setIsSuperAdmin(true);
      } else {
        return; // Non-superadmins don't get this UI
      }

      // 2. Check current view-as simulation
      const viewAsCookie = document.cookie
        .split('; ')
        .find(r => r.startsWith('hz_view_as_role='))
        ?.split('=')[1];
      
      setCurrentViewRole(viewAsCookie || 'superadmin');
    } catch {
      // Decode error / no token
    }
  }, []);

  if (!isSuperAdmin) return null;

  const handleSelectRole = async (roleId: string) => {
    try {
      const isClearing = roleId === 'superadmin';
      const payload = isClearing ? { role: null } : { role: roleId };
      
      const res = await fetch('/api/v1/auth/view-as', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('hz_access=')[1].split(';')[0]}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to set view-as role');
      
      toast.success(isClearing ? 'Restored SuperAdmin View' : `Viewing as ${roleId}`);
      
      // Reload page to apply new server-side context
      setTimeout(() => {
        window.location.reload();
      }, 800);
      
    } catch (err) {
      toast.error('Could not switch role');
    }
  };

  const isSimulating = currentViewRole && currentViewRole !== 'superadmin';

  return (
    <IzDropdownMenu>
      <IzDropdownMenuTrigger asChild>
        <IzButton 
          variant="outline" 
          size="sm" 
          style={{ 
            height: 28, 
            display: 'flex', 
            gap: 6,
            borderColor: isSimulating ? 'var(--color-warning)' : 'var(--color-border)',
            color: isSimulating ? 'var(--color-warning)' : 'var(--color-text)'
          }}
          title="View As Role Simulation"
        >
          {isSimulating ? <ShieldAlert size={14} /> : <Eye size={14} />}
          <span style={{ fontSize: 12, fontWeight: 500 }}>
            {isSimulating ? `View As: ${currentViewRole}` : 'God Mode'}
          </span>
        </IzButton>
      </IzDropdownMenuTrigger>
      
      <IzDropdownMenuContent align="end" style={{ width: 180 }}>
        <IzDropdownMenuLabel>Simulate View As Role</IzDropdownMenuLabel>
        <IzDropdownMenuSeparator />
        {ROLES.map((r) => (
          <IzDropdownMenuItem 
            key={r.id} 
            onClick={() => handleSelectRole(r.id)}
            style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            {r.label}
            {currentViewRole === r.id && <Check size={14} style={{ color: 'var(--color-primary)' }} />}
          </IzDropdownMenuItem>
        ))}
      </IzDropdownMenuContent>
    </IzDropdownMenu>
  );
}
