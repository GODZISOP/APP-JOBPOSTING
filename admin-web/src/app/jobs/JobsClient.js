"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import JobActions from './JobActions';
import { Briefcase, RefreshCw } from 'lucide-react';

export default function JobsClient({ initialJobs }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  useEffect(() => {
    // Listen to changes on the jobs table
    const channel = supabase
      .channel('admin_public_jobs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        (payload) => {
          console.log('Realtime jobs change received!', payload);
          
          if (payload.eventType === 'UPDATE') {
            setJobs(prev => prev.map(job => 
              job.id === payload.new.id ? { ...job, ...payload.new } : job
            ));
          } else if (payload.eventType === 'INSERT') {
            // For insert, we probably need relations (profiles), so let's refetch from server
            router.refresh();
          } else if (payload.eventType === 'DELETE') {
            setJobs(prev => prev.filter(job => job.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
  const pendingJobs = jobs.filter(j => j.status === 'pending' && new Date(j.created_at) >= fifteenDaysAgo);
  const activeJobs = jobs.filter(j => 
    j.status !== 'pending' && j.status !== 'rejected' && j.status !== 'deleted' &&
    new Date(j.created_at) >= fifteenDaysAgo
  );
  const archivedJobs = jobs.filter(j => 
    (j.status === 'rejected' || j.status === 'deleted') && 
    new Date(j.created_at) >= fifteenDaysAgo
  );

  return (
    <div>
      <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Briefcase size={32} color="var(--accent-color)" style={{ flexShrink: 0 }} />
            Jobs Management
          </h1>
          <p className="subtitle">Approve, reject, or manage all job listings on the platform.</p>
        </div>
        <button 
          onClick={handleRefresh} 
          className="btn btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={isRefreshing ? "spin" : ""} />
          Refresh
        </button>
      </div>

      {pendingJobs.length > 0 && (
        <div className="card glass-card" style={{ marginBottom: 40, borderColor: 'var(--warning)' }}>
          <h2 style={{ marginBottom: 20, color: 'var(--warning)' }}>Pending Approvals ({pendingJobs.length})</h2>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Posted By</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingJobs.map(job => (
                  <tr key={job.id}>
                    <td style={{ fontWeight: 600 }}>{job.title}</td>
                    <td>{job.company}</td>
                    <td>{job.profiles?.name || job.posted_by}</td>
                    <td>{new Date(job.created_at).toLocaleDateString()}</td>
                    <td style={{ maxWidth: 300 }}>
                      <details>
                        <summary style={{ cursor: 'pointer', color: 'var(--accent-color)', outline: 'none' }}>View details</summary>
                        <div style={{ marginTop: 8, fontSize: 14, color: 'var(--text-light)', background: 'var(--bg-secondary)', padding: 8, borderRadius: 8 }}>
                          {job.description}
                        </div>
                      </details>
                    </td>
                    <td>
                      <JobActions jobId={job.id} type="pending" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card glass-card" style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>All Active Jobs ({activeJobs.length})</h2>
        {activeJobs.length === 0 ? (
          <p className="subtitle">No active jobs found.</p>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeJobs.map(job => (
                  <tr key={job.id} style={{ background: job.is_top ? 'rgba(245, 158, 11, 0.05)' : 'transparent' }}>
                    <td style={{ fontWeight: 600 }}>
                      {job.title}
                      {job.is_top && <span style={{ marginLeft: 8, fontSize: 12, padding: '2px 6px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', borderRadius: 12 }}>Featured</span>}
                    </td>
                    <td>{job.company}</td>
                    <td style={{ maxWidth: 200 }}>
                      <details>
                        <summary style={{ cursor: 'pointer', color: 'var(--accent-color)', outline: 'none' }}>View</summary>
                        <div style={{ marginTop: 8, fontSize: 14, color: 'var(--text-light)', background: 'var(--bg-secondary)', padding: 8, borderRadius: 8 }}>
                          {job.description}
                        </div>
                      </details>
                    </td>
                    <td>
                      <span className={`badge ${job.status === 'approved' ? 'badge-approved' : ''}`}>
                        {job.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <JobActions jobId={job.id} type="active" isTop={job.is_top} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {archivedJobs.length > 0 && (
        <div className="card glass-card" style={{ marginBottom: 40, borderColor: 'var(--text-muted)' }}>
          <h2 style={{ marginBottom: 20, color: 'var(--text-muted)' }}>Archived / Rejected Jobs ({archivedJobs.length})</h2>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {archivedJobs.map(job => (
                  <tr key={job.id}>
                    <td style={{ fontWeight: 600 }}>{job.title}</td>
                    <td>{job.company}</td>
                    <td>
                      <span className={`badge`}>
                        {job.status}
                      </span>
                    </td>
                    <td>
                      <JobActions jobId={job.id} type="active" isTop={job.is_top} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Add spin animation style inline if not exists in global css */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}} />
    </div>
  );
}
