'use client';

import React, { useState, useEffect } from 'react';
import { Users, ShieldBan, Trash2, CheckCircle, Search, X } from 'lucide-react';

export default function UsersClient({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers || []);
  const [search, setSearch] = useState('');
  
  // Modals
  const [banModalVisible, setBanModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  // Search filter
  const filteredUsers = users.filter(u => {
    const s = search.toLowerCase();
    return (u.name || '').toLowerCase().includes(s) || 
           (u.email || '').toLowerCase().includes(s) || 
           (u.phone || '').toLowerCase().includes(s);
  });

  const handleBanClick = (user) => {
    setSelectedUser(user);
    setBanReason('');
    setBanModalVisible(true);
  };

  const handleUnbanClick = async (user) => {
    if (!confirm(`Are you sure you want to unban ${user.name}?`)) return;
    setLoadingAction(true);
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unban', userId: user.id })
      });
      if (!res.ok) throw new Error(await res.text());
      setUsers(users.map(u => u.id === user.id ? { ...u, is_banned: false, ban_reason: null } : u));
    } catch (e) {
      alert('Error unbanning user: ' + e.message);
    }
    setLoadingAction(false);
  };

  const submitBan = async () => {
    if (!banReason.trim()) {
      alert('Please provide a reason for the ban.');
      return;
    }
    setLoadingAction(true);
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ban', userId: selectedUser.id, reason: banReason })
      });
      if (!res.ok) throw new Error(await res.text());
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, is_banned: true, ban_reason: banReason } : u));
      setBanModalVisible(false);
    } catch (e) {
      alert('Error banning user: ' + e.message);
    }
    setLoadingAction(false);
  };

  const handleDelete = async (user) => {
    if (!confirm(`WARNING: Are you sure you want to permanently delete ${user.name} and all their data? This cannot be undone.`)) return;
    setLoadingAction(true);
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', userId: user.id })
      });
      if (!res.ok) throw new Error(await res.text());
      setUsers(users.filter(u => u.id !== user.id));
    } catch (e) {
      alert('Error deleting user: ' + e.message);
    }
    setLoadingAction(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Users size={32} color="var(--accent-color)" />
          <div>
            <h1>Users Management</h1>
            <p className="subtitle">View and moderate all users (Employers & Job Seekers).</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-color)', padding: '8px 16px', borderRadius: 24, border: '1px solid var(--border-color)', width: 300 }}>
          <Search size={18} color="var(--text-secondary)" style={{ marginRight: 8 }} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-color)', width: '100%' }}
          />
        </div>
      </div>

      <div className="card glass-card">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Location / Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                    No users found.
                  </td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} style={{ opacity: user.is_banned ? 0.7 : 1 }}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="avatar" style={{ width: 40, height: 40, borderRadius: 20 }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                          {user.name ? user.name[0].toUpperCase() : '?'}
                        </div>
                      )}
                      <div>
                        <div>{user.name || 'Unknown'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user.title || 'User'}</div>
                        {user.is_banned && user.ban_reason && (
                          <div style={{ fontSize: 11, color: 'var(--warning)', marginTop: 4 }}>Reason: {user.ban_reason}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{user.location ? user.location.split('|')[0] : 'N/A'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user.phone || 'No phone'}</div>
                  </td>
                  <td>
                    {user.is_banned ? (
                      <span className="badge badge-rejected" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--warning)' }}>Banned</span>
                    ) : (
                      <span className="badge badge-approved">Active</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {user.is_banned ? (
                        <button onClick={() => handleUnbanClick(user)} disabled={loadingAction} className="btn btn-success" style={{ padding: '8px 12px' }} title="Unban User">
                          <CheckCircle size={16} />
                        </button>
                      ) : (
                        <button onClick={() => handleBanClick(user)} disabled={loadingAction} className="btn btn-danger" style={{ padding: '8px 12px', backgroundColor: 'transparent', borderColor: 'var(--warning)', color: 'var(--warning)' }} title="Ban User">
                          <ShieldBan size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(user)} disabled={loadingAction} className="btn btn-danger" style={{ padding: '8px 12px' }} title="Delete User">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BAN MODAL */}
      {banModalVisible && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'var(--card-bg)', borderRadius: 20, padding: 30, width: '100%', maxWidth: 460,
            border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0, color: 'var(--warning)' }}>
                <ShieldBan size={24} /> Ban User
              </h2>
              <button onClick={() => setBanModalVisible(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              You are about to ban <strong>{selectedUser?.name}</strong>. They will immediately lose access to the app and see this reason.
            </p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Ban Reason (Visible to user)</label>
              <textarea 
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="e.g. Violating community guidelines, posting spam jobs..."
                style={{
                  width: '100%', height: 100, padding: 12, borderRadius: 12, 
                  border: '1px solid var(--border-color)', background: 'var(--bg-color)', 
                  color: 'var(--text-color)', fontFamily: 'inherit', resize: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setBanModalVisible(false)} className="btn btn-secondary" disabled={loadingAction}>
                Cancel
              </button>
              <button onClick={submitBan} className="btn btn-danger" disabled={loadingAction} style={{ background: 'var(--warning)', borderColor: 'var(--warning)' }}>
                {loadingAction ? 'Banning...' : 'Confirm Ban'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
