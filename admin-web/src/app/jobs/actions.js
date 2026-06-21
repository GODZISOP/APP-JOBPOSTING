'use server';

import { supabaseAdmin } from '../../lib/supabase';
import { revalidatePath } from 'next/cache';

export async function approveJob(jobId) {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');
  const { error } = await supabaseAdmin.from('jobs').update({ status: 'approved' }).eq('id', jobId);
  if (error) throw error;
  revalidatePath('/jobs');
  revalidatePath('/');
}

export async function rejectJob(jobId) {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');
  const { error } = await supabaseAdmin.from('jobs').update({ status: 'rejected' }).eq('id', jobId);
  if (error) throw error;
  revalidatePath('/jobs');
  revalidatePath('/');
}

export async function deleteJob(jobId) {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');
  await supabaseAdmin.from('likes').delete().eq('job_id', jobId);
  await supabaseAdmin.from('applications').delete().eq('job_id', jobId);
  const { error } = await supabaseAdmin.from('jobs').delete().eq('id', jobId);
  if (error) throw error;
  revalidatePath('/jobs');
  revalidatePath('/');
}

export async function toggleTopJob(jobId, currentStatus) {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');
  const updateData = { is_top: !currentStatus };
  if (!currentStatus) {
    updateData.top_updated_at = new Date().toISOString();
  }
  const { error } = await supabaseAdmin.from('jobs').update(updateData).eq('id', jobId);
  if (error) throw error;
  revalidatePath('/jobs');
  revalidatePath('/');
}
