import { supabaseAdmin } from '../../lib/supabase';
import JobsClient from './JobsClient';

export const revalidate = 0;

async function getJobs() {
  if (!supabaseAdmin) return [];
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*, profiles!jobs_posted_by_fkey(name, email)') // Note: adjust relationship if it differs
      .order('created_at', { ascending: false });
    
    if (error) {
      console.warn("Could not fetch jobs:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default async function JobsManagement() {
  const jobs = await getJobs();

  return (
    <JobsClient initialJobs={jobs} />
  );
}
