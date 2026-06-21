import { supabaseAdmin } from '../lib/supabase';
import { Users, Briefcase, Clock, Activity } from 'lucide-react';

export const revalidate = 0; // Disable caching to always fetch fresh data

async function getStats() {
  if (!supabaseAdmin) return null;

  try {
    const { count: usersCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
    
    // Total jobs
    const { count: jobsCount } = await supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true });
    
    // Note: If 'status' column doesn't exist yet, this will fail. We use a try/catch to fallback.
    let pendingJobsCount = 0;
    try {
      const { count } = await supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      pendingJobsCount = count || 0;
    } catch (e) {
      console.warn("Status column might not exist yet.");
    }

    return { usersCount: usersCount || 0, jobsCount: jobsCount || 0, pendingJobsCount };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
}

export default async function Dashboard() {
  const stats = await getStats();

  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <h1>Dashboard Overview</h1>
        <p className="subtitle">Welcome to the JobLink Admin Panel. Here's what's happening today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 48 }}>
        
        {/* Stat Card 1 */}
        <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ backgroundColor: 'rgba(232, 245, 66, 0.1)', padding: 16, borderRadius: 16, color: 'var(--accent-color)' }}>
            <Users size={28} />
          </div>
          <div>
            <p className="subtitle" style={{ fontSize: 14 }}>Total Users</p>
            <h2 style={{ fontSize: 32 }}>{stats?.usersCount || 0}</h2>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: 16, borderRadius: 16, color: 'var(--success)' }}>
            <Briefcase size={28} />
          </div>
          <div>
            <p className="subtitle" style={{ fontSize: 14 }}>Total Jobs</p>
            <h2 style={{ fontSize: 32 }}>{stats?.jobsCount || 0}</h2>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 16, borderRadius: 16, color: 'var(--warning)' }}>
            <Clock size={28} />
          </div>
          <div>
            <p className="subtitle" style={{ fontSize: 14 }}>Pending Approval</p>
            <h2 style={{ fontSize: 32 }}>{stats?.pendingJobsCount || 0}</h2>
          </div>
        </div>

      </div>

      <div className="card glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Activity color="var(--accent-color)" />
          <h2>Recent Activity</h2>
        </div>
        <p className="subtitle" style={{ marginBottom: 20 }}>Activity logging will appear here once users interact with the platform.</p>
        
        {/* We can add a simple table here later for recent jobs/users */}
        <div style={{ padding: 40, textAlign: 'center', border: '1px dashed var(--card-border)', borderRadius: 12 }}>
          <p className="subtitle">No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
}
