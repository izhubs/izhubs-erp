'use client';

import { useState, useEffect } from 'react';
import { IzButton } from '@izerp-theme/components/ui/IzButton';
import { IzBadge } from '@izerp-theme/components/ui/IzBadge';
import { 
  IzModal, IzModalContent, IzModalHeader, 
  IzModalTitle, IzModalBody, IzModalFooter, IzModalClose
} from '@izerp-theme/components/ui/IzModal';
import { IzInput } from '@izerp-theme/components/ui/IzInput';
import { IzSelect } from '@izerp-theme/components/ui/IzSelect';
import { ShieldAlert, UserPlus, MoreVertical } from 'lucide-react';
import tableStyles from '@izerp-theme/components/ui/IzTable.module.scss';
import cx from 'clsx';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'member' | 'viewer';
  active: boolean;
}

export default function UsersSettingsPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal State
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', role: 'member' });
  const [isCreating, setIsCreating] = useState(false);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editRole, setEditRole] = useState<'superadmin'|'admin'|'member'|'viewer'>('member');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/users');
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser() {
    if (!createForm.name || !createForm.email) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const json = await res.json();
      if (json.success) {
        setUsers(prev => [json.data, ...prev]);
        setShowCreate(false);
        setCreateForm({ name: '', email: '', role: 'member' });
      } else {
        alert(json.error?.message || 'Failed to create user');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdateUser() {
    if (!editingUser) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/v1/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editRole }),
      });
      const json = await res.json();
      if (json.success) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? json.data : u));
        setEditingUser(null);
      } else {
        alert(json.error?.message || 'Failed to update user');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleToggleActive(user: UserData) {
    if (!confirm(`Are you sure you want to ${user.active ? 'deactivate' : 'activate'} this user?`)) return;
    try {
      const res = await fetch(`/api/v1/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
      });
      const json = await res.json();
      if (json.success) {
        setUsers(prev => prev.map(u => u.id === user.id ? json.data : u));
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>User Management</h1>
        <IzButton onClick={() => setShowCreate(true)} style={{ display: 'flex', gap: 8 }}>
          <UserPlus size={16} /> Invite User
        </IzButton>
      </div>

      <div className={tableStyles.tableWrapper} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
        <table className={tableStyles.table}>
          <thead className={tableStyles.thead}>
            <tr className={tableStyles.tr}>
              <th className={tableStyles.th}>Name</th>
              <th className={tableStyles.th}>Email</th>
              <th className={tableStyles.th}>Role</th>
              <th className={tableStyles.th}>Status</th>
              <th className={tableStyles.th} style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody className={tableStyles.tbody}>
            {loading ? (
              <tr className={tableStyles.tr}>
                <td className={tableStyles.td} colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr className={tableStyles.tr}>
                <td className={tableStyles.td} colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className={tableStyles.tr} style={{ opacity: u.active ? 1 : 0.6 }}>
                  <td className={tableStyles.td} style={{ fontWeight: 500 }}>{u.name}</td>
                  <td className={tableStyles.td} style={{ color: 'var(--color-text-muted)' }}>{u.email}</td>
                  <td className={tableStyles.td}>
                    <IzBadge variant={u.role === 'superadmin' ? 'destructive' : u.role === 'admin' ? 'warning' : 'default'} style={{ textTransform: 'capitalize' }}>
                      {u.role}
                    </IzBadge>
                  </td>
                  <td className={tableStyles.td}>
                    {u.active ? <IzBadge variant="success">Active</IzBadge> : <IzBadge variant="secondary">Inactive</IzBadge>}
                  </td>
                  <td className={tableStyles.td} style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <IzButton variant="ghost" size="sm" onClick={() => { setEditingUser(u); setEditRole(u.role); }}>Edit</IzButton>
                      <IzButton variant={u.active ? 'destructive' : 'outline'} size="sm" onClick={() => handleToggleActive(u)}>
                        {u.active ? 'Deactivate' : 'Activate'}
                      </IzButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      <IzModal open={showCreate} onOpenChange={setShowCreate}>
        <IzModalContent size="md">
          <IzModalHeader>
            <IzModalTitle>Invite New User</IzModalTitle>
          </IzModalHeader>
          <IzModalBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: 12, background: 'var(--color-primary-muted)', borderRadius: 8, color: 'var(--color-primary)', fontSize: 13, display: 'flex', gap: 8 }}>
                <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Users will be assigned a default password: <b>izhubs2026</b> for MVP. They can change it after logging in.</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500 }}>Full Name</label>
                <IzInput value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} placeholder="e.g. John Doe" autoFocus />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500 }}>Email Address</label>
                <IzInput type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} placeholder="john@company.com" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500 }}>Role</label>
                <IzSelect 
                  value={{ value: createForm.role, label: createForm.role.charAt(0).toUpperCase() + createForm.role.slice(1) }}
                  onChange={(opt: any) => setCreateForm({...createForm, role: opt.value})}
                  options={[
                    { value: 'admin', label: 'Admin (Full access to workspace)' },
                    { value: 'member', label: 'Member (Standard access)' },
                    { value: 'viewer', label: 'Viewer (Read-only access)' },
                  ]}
                />
              </div>
            </div>
          </IzModalBody>
          <IzModalFooter>
            <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'flex-end' }}>
              <IzButton variant="ghost" onClick={() => setShowCreate(false)}>Cancel</IzButton>
              <IzButton onClick={handleCreateUser} disabled={isCreating || !createForm.name || !createForm.email}>
                {isCreating ? 'Creating...' : 'Invite User'}
              </IzButton>
            </div>
          </IzModalFooter>
        </IzModalContent>
      </IzModal>

      {/* Edit Role Modal */}
      <IzModal open={editingUser !== null} onOpenChange={(v) => !v && setEditingUser(null)}>
        <IzModalContent size="sm">
          <IzModalHeader>
            <IzModalTitle>Edit Role: {editingUser?.name}</IzModalTitle>
          </IzModalHeader>
          <IzModalBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500 }}>New Role for {editingUser?.email}</label>
                <IzSelect 
                  value={{ value: editRole, label: editRole.charAt(0).toUpperCase() + editRole.slice(1) }}
                  onChange={(opt: any) => setEditRole(opt.value)}
                  options={[
                    { value: 'admin', label: 'Admin (Full access)' },
                    { value: 'member', label: 'Member (Standard)' },
                    { value: 'viewer', label: 'Viewer (Read-only)' },
                  ]}
                />
              </div>
            </div>
          </IzModalBody>
          <IzModalFooter>
            <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'flex-end' }}>
              <IzButton variant="ghost" onClick={() => setEditingUser(null)}>Cancel</IzButton>
              <IzButton onClick={handleUpdateUser} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </IzButton>
            </div>
          </IzModalFooter>
        </IzModalContent>
      </IzModal>
    </div>
  );
}
