import { supabaseAdmin } from '../../lib/supabase';
import UsersClient from './UsersClient';

export const revalidate = 0;

async function getUsers() {
  if (!supabaseAdmin) return [];
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.warn("Could not fetch users:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default async function UsersManagement() {
  const users = await getUsers();

  return <UsersClient initialUsers={users} />;
}
