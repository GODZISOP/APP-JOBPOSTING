import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.43.4/+esm';

// Supabase Configuration from your live credentials
const SUPABASE_URL = 'https://mbmgulgrgxruptfaodus.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_37Xm5MbMyvgFKa5QkhA0eQ_zKCeXMcG';

// Create Supabase Client directly in browser via CDN ESM
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const statUsers = document.getElementById('stat-users');
const statJobs = document.getElementById('stat-jobs');
const statApplications = document.getElementById('stat-applications');
const jobsTableBody = document.getElementById('jobs-table-body');
const btnRefresh = document.getElementById('btn-refresh');

// Load Dashboard Data
async function loadDashboard() {
    try {
        console.log('🔄 Fetching live data from Supabase...');
        showLoadingState();

        // 1. Fetch counts in parallel
        const [usersRes, jobsRes, appsRes] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('jobs').select('*', { count: 'exact', head: true }),
            supabase.from('applications').select('*', { count: 'exact', head: true })
        ]);

        // Update stats widgets (fall back to 0 if table doesn't exist yet)
        statUsers.textContent = usersRes.count !== null ? usersRes.count : 0;
        statJobs.textContent = jobsRes.count !== null ? jobsRes.count : 0;
        statApplications.textContent = appsRes.count !== null ? appsRes.count : 0;

        // 2. Fetch Jobs for Moderation list
        const { data: jobs, error: jobsErr } = await supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });

        if (jobsErr) throw jobsErr;

        renderJobsTable(jobs);

    } catch (err) {
        console.error('❌ Error fetching dashboard metrics:', err.message);
        alert('Database Sync Error: ' + err.message + '\n\nMake sure to run your migrations (schema.sql) in the Supabase SQL Editor!');
        showErrorState(err.message);
    }
}

// Render Jobs in Table
function renderJobsTable(jobs) {
    jobsTableBody.innerHTML = '';

    if (!jobs || jobs.length === 0) {
        jobsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="placeholder-row">
                    <i class="fa-solid fa-folder-open" style="font-size: 24px; color: #8E8E93; display: block; margin-bottom: 10px;"></i>
                    No job postings found in the database.
                </td>
            </tr>
        `;
        return;
    }

    jobs.forEach(job => {
        const tr = document.createElement('tr');
        
        // Match standard React Native type styles
        const typeClass = job.type === 'Full Time' ? 'type-full-time' : 
                          job.type === 'Part Time' ? 'type-part-time' : 'type-remote';

        tr.innerHTML = `
            <td style="font-weight: 600;">${job.title}</td>
            <td style="color: #8E8E93;">${job.company}</td>
            <td><i class="fa-solid fa-location-dot" style="color: #05ffa3; margin-right: 5px;"></i> ${job.location}</td>
            <td style="font-weight: 600; color: #DFFF00;">${job.salary || 'N/A'}</td>
            <td><span class="job-type-pill ${typeClass}">${job.type}</span></td>
            <td>
                <button class="btn-delete" data-id="${job.id}">
                    <i class="fa-solid fa-trash-can"></i> Delete
                </button>
            </td>
        `;

        // Handle direct row deletion
        tr.querySelector('.btn-delete').addEventListener('click', async (e) => {
            const jobId = e.target.closest('button').dataset.id;
            if (confirm(`Are you sure you want to delete this job listing? (ID: ${jobId})`)) {
                await deleteJob(jobId);
            }
        });

        jobsTableBody.appendChild(tr);
    });
}

// Delete Job from Supabase
async function deleteJob(jobId) {
    try {
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', jobId);

        if (error) throw error;
        
        alert('Job listing deleted successfully.');
        loadDashboard(); // Reload statistics and list
    } catch (err) {
        console.error('Delete failed:', err.message);
        alert('Failed to delete job listing: ' + err.message);
    }
}

// Show loading states
function showLoadingState() {
    statUsers.textContent = '...';
    statJobs.textContent = '...';
    statApplications.textContent = '...';
    jobsTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="placeholder-row">
                <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #05ffa3; display: block; margin-bottom: 10px;"></i>
                Syncing with Live Database...
            </td>
        </tr>
    `;
}

// Show error states
function showErrorState(msg) {
    statUsers.textContent = 'ERR';
    statJobs.textContent = 'ERR';
    statApplications.textContent = 'ERR';
    jobsTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="placeholder-row" style="color: #FF3B30;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 24px; display: block; margin-bottom: 10px;"></i>
                Connection failed: ${msg}
            </td>
        </tr>
    `;
}

// Event Listeners
btnRefresh.addEventListener('click', loadDashboard);

// Auto Load on Mount
document.addEventListener('DOMContentLoaded', loadDashboard);
