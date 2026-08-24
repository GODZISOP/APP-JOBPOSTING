import { supabaseAdmin } from '../lib/supabase';
import { Users, Briefcase, Clock, Activity } from 'lucide-react';

export const revalidate = 0; // Disable caching to always fetch fresh data

async function getStats() {
  if (!supabaseAdmin) return null;

  try {
    const { count: usersCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });

    // Total jobs (excluding deleted and expired older than 15 days)
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
    const { count: jobsCount } = await supabaseAdmin
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'deleted')
      .gte('created_at', fifteenDaysAgo);

    let pendingJobsCount = 0;
    try {
      const { count, error } = await supabaseAdmin.from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .gte('created_at', fifteenDaysAgo);
      if (error) throw error;
      pendingJobsCount = count || 0;
    } catch (e) {
      console.warn("Status column might not exist yet for pending.", e);
    }

    // Active/Approved jobs — same 15-day window as app and Jobs Management
    let activeJobsCount = 0;
    try {
      const { count, error } = await supabaseAdmin
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gte('created_at', fifteenDaysAgo);

      if (error) throw error;
      activeJobsCount = count !== null ? count : 0;
    } catch (e) {
      console.warn("Status column might not exist yet for approved.", e);
      activeJobsCount = jobsCount ? jobsCount - pendingJobsCount : 0;
    }

    // Featured jobs
    let featuredJobsCount = 0;
    try {
      // First try to check if is_top exists
      const { count: topCount, error: topError } = await supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }).eq('is_top', true).gte('created_at', fifteenDaysAgo);
      if (!topError && topCount) featuredJobsCount += topCount;

      // Try to check if likes column exists
      try {
        const { count: likesCount, error: likesError } = await supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }).gte('likes', 10).gte('created_at', fifteenDaysAgo);
        if (!likesError && likesCount) featuredJobsCount += likesCount;
      } catch (e) {
        // Ignored
      }
    } catch (e) {
      console.warn("Featured logic failed.", e);
    }

    let reportedJobs = [];
    try {
      // Step 1: Fetch raw reports
      const { data: reportsData, error: reportsErr } = await supabaseAdmin
        .from('job_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!reportsErr && reportsData && reportsData.length > 0) {
        // Step 2: Fetch full job details
        const jobIds = [...new Set(reportsData.map(r => r.job_id).filter(Boolean))];
        const { data: jobsData } = await supabaseAdmin
          .from('jobs')
          .select('id, title, company, description, location, salary, type, category, posted_by')
          .in('id', jobIds);

        // Step 3: Fetch reporter profiles
        const reporterIds = [...new Set(reportsData.map(r => r.reporter_id).filter(Boolean))];
        let profilesData = [];
        if (reporterIds.length > 0) {
          const { data: pData } = await supabaseAdmin
            .from('profiles')
            .select('id, name, email, phone')
            .in('id', reporterIds);
          profilesData = pData || [];
        }

        // Step 4: Fetch job poster profiles
        const posterIds = [...new Set((jobsData || []).map(j => j.posted_by).filter(Boolean))];
        let posterProfiles = [];
        if (posterIds.length > 0) {
          const { data: ppData } = await supabaseAdmin
            .from('profiles')
            .select('id, name, email, phone')
            .in('id', posterIds);
          posterProfiles = ppData || [];
        }

        // Step 5: Merge everything
        reportedJobs = reportsData
          .map(report => {
            const job = jobsData?.find(j => j.id === report.job_id) || null;
            const poster = job ? posterProfiles?.find(p => p.id === job.posted_by) || null : null;
            return {
              ...report,
              job,
              poster,
              reporter: profilesData?.find(p => p.id === report.reporter_id) || null,
            };
          })
          .filter(item => item.job !== null);
      }
    } catch (e) {
      console.warn("Reported jobs logic failed.", e);
    }

    return {
      usersCount: usersCount || 0,
      jobsCount: jobsCount || 0,
      pendingJobsCount,
      activeJobsCount,
      featuredJobsCount,
      reportedJobs
    };
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
        <p className="subtitle">Welcome to the BKJ Admin Panel. Here's what's happening today.</p>
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

        {/* Stat Card 3 - Active Jobs */}
        <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 16, borderRadius: 16, color: '#3B82F6' }}>
            <Activity size={28} />
          </div>
          <div>
            <p className="subtitle" style={{ fontSize: 14 }}>Active Jobs</p>
            <h2 style={{ fontSize: 32 }}>{stats?.activeJobsCount || 0}</h2>
          </div>
        </div>

        {/* Stat Card 4 - Pending */}
        <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 16, borderRadius: 16, color: 'var(--warning)' }}>
            <Clock size={28} />
          </div>
          <div>
            <p className="subtitle" style={{ fontSize: 14 }}>Pending Approval</p>
            <h2 style={{ fontSize: 32 }}>{stats?.pendingJobsCount || 0}</h2>
          </div>
        </div>

        {/* Stat Card 5 - Featured Ads */}
        <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 16, borderRadius: 16, color: '#EF4444' }}>
            <Activity size={28} />
          </div>
          <div>
            <p className="subtitle" style={{ fontSize: 14 }}>Featured Ads</p>
            <h2 style={{ fontSize: 32 }}>{stats?.featuredJobsCount || 0}</h2>
          </div>
        </div>

      </div>

      <div className="card glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Activity color="var(--accent-color)" />
          <h2>Recent Activity</h2>
        </div>
        <p className="subtitle" style={{ marginBottom: 20 }}>Activity logging will appear here once users interact with the platform.</p>

        <div style={{ padding: 40, textAlign: 'center', border: '1px dashed var(--card-border)', borderRadius: 12 }}>
          <p className="subtitle">No recent activity to display.</p>
        </div>
      </div>

      {/* Reported Jobs Section */}
      <div className="card glass-card" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Activity color="#EF4444" />
          <h2>Reported Jobs</h2>
          {stats?.reportedJobs?.length > 0 && (
            <span style={{ background: '#EF4444', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 13, fontWeight: 700 }}>
              {stats.reportedJobs.length}
            </span>
          )}
        </div>
        <p className="subtitle" style={{ marginBottom: 24 }}>Jobs flagged by users. Review job details, reporter and poster info below.</p>

        {stats?.reportedJobs && stats.reportedJobs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {stats.reportedJobs.map((report) => (
              <div key={report.id} style={{
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 14,
                padding: 20,
                background: 'rgba(239,68,68,0.04)'
              }}>
                {/* Report Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ background: '#EF4444', color: '#fff', borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>🚩 Report</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{new Date(report.created_at).toLocaleString()}</span>
                  </div>
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '6px 14px' }}>
                    <span style={{ color: '#EF4444', fontWeight: 700, fontSize: 13 }}>Reason: </span>
                    <span style={{ color: '#EF4444', fontSize: 13 }}>{report.reason}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>

                  {/* Job Details */}
                  <div style={{ background: 'var(--card-bg)', borderRadius: 10, padding: 16, border: '1px solid var(--card-border)' }}>
                    <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 14, color: 'var(--accent-color)' }}>📋 Job Details</p>
                    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{report.job?.title || '—'}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Company: <strong>{report.job?.company || '—'}</strong></p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Location: {report.job?.location || '—'}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Salary: {report.job?.salary || '—'}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Type: {report.job?.type || '—'} | Category: {report.job?.category || '—'}</p>
                    {report.job?.description && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 8, borderTop: '1px solid var(--card-border)', paddingTop: 8 }}>
                        {report.job.description.slice(0, 200)}{report.job.description.length > 200 ? '...' : ''}
                      </p>
                    )}
                  </div>

                  {/* Reporter Details */}
                  <div style={{ background: 'var(--card-bg)', borderRadius: 10, padding: 16, border: '1px solid var(--card-border)' }}>
                    <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 14, color: '#3B82F6' }}>👤 Reporter (Who reported)</p>
                    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{report.reporter?.name || 'Anonymous'}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Email: {report.reporter?.email || '—'}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Phone: {report.reporter?.phone || '—'}</p>
                  </div>

                  {/* Job Poster Details */}
                  <div style={{ background: 'var(--card-bg)', borderRadius: 10, padding: 16, border: '1px solid var(--card-border)' }}>
                    <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 14, color: '#F59E0B' }}>🏢 Job Poster (Reported user)</p>
                    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{report.poster?.name || '—'}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Email: {report.poster?.email || '—'}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Phone: {report.poster?.phone || '—'}</p>
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', border: '1px dashed var(--card-border)', borderRadius: 12 }}>
            <p className="subtitle">No reported jobs.</p>
          </div>
        )}
      </div>
    </div>
  );
}
