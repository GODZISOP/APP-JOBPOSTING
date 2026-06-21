'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Trash2, Star } from 'lucide-react';
import { approveJob, rejectJob, deleteJob, toggleTopJob } from './actions';

export default function JobActions({ jobId, type, isTop }) {
  const [loading, setLoading] = useState(false);

  async function handleAction(actionType) {
    setLoading(true);
    try {
      if (actionType === 'approve') await approveJob(jobId);
      if (actionType === 'reject') await rejectJob(jobId);
      if (actionType === 'delete') await deleteJob(jobId);
      if (actionType === 'toggle_top') await toggleTopJob(jobId, isTop);
    } catch (error) {
      console.error(error);
      alert('Action failed. See console.');
    } finally {
      setLoading(false);
    }
  }

  if (type === 'pending') {
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button 
          onClick={() => handleAction('approve')} 
          disabled={loading}
          className="btn btn-success" 
          style={{ padding: '8px 16px', fontSize: 13, opacity: loading ? 0.5 : 1 }}
        >
          <CheckCircle size={16} /> Approve
        </button>
        <button 
          onClick={() => handleAction('reject')} 
          disabled={loading}
          className="btn btn-danger" 
          style={{ padding: '8px 16px', fontSize: 13, opacity: loading ? 0.5 : 1 }}
        >
          <XCircle size={16} /> Reject
        </button>
      </div>
    );
  }

  if (type === 'active') {
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button 
          onClick={() => handleAction('toggle_top')} 
          disabled={loading}
          className="btn btn-secondary" 
          style={{ padding: '8px 12px', opacity: loading ? 0.5 : 1, color: isTop ? '#f59e0b' : 'inherit' }}
          title={isTop ? "Remove from Top Jobs" : "Mark as Top Job"}
        >
          <Star size={16} fill={isTop ? "#f59e0b" : "none"} />
        </button>
        <button 
          onClick={() => handleAction('delete')} 
          disabled={loading}
          className="btn btn-danger" 
          style={{ padding: '8px 12px', opacity: loading ? 0.5 : 1 }}
          title="Delete Job"
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  }

  return null;
}
