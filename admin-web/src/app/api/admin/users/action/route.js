import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabase';

export async function POST(req) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 });
  }

  try {
    const { action, userId, reason } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (action === 'ban') {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_banned: true, ban_reason: reason })
        .eq('id', userId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } 
    
    else if (action === 'unban') {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_banned: false, ban_reason: null })
        .eq('id', userId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } 
    
    else if (action === 'delete') {
      // Supabase admin auth.admin.deleteUser deletes the user from Auth and cascades to public.profiles if configured.
      // But we can also just delete the profile. Wait, deleting profile without auth is bad.
      // We will try deleting from `profiles` first, which might cascade depending on schema, or we can use admin API.
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (profileError) throw profileError;
      
      // Attempt to delete auth user if permissions allow (might fail if not using service role key, but admin is usually service role)
      await supabaseAdmin.auth.admin.deleteUser(userId);
      
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('User action error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
