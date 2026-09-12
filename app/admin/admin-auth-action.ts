'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function claimAdminRole(passcode: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Please sign in first.' };
    }

    const validPasscode = process.env.ADMIN_SECRET_KEY;
    const userEmail = (user.email || '').toLowerCase().trim();

    // Check if passcode matches, or if email matches ADMIN_EMAILS or @zyniq.cloud
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isMatch =
      (validPasscode && passcode.trim() === validPasscode) ||
      (adminEmails.length > 0 && adminEmails.includes(userEmail)) ||
      userEmail.endsWith('@zyniq.cloud');

    if (!isMatch) {
      return { error: 'Invalid admin passcode or unauthorized email.' };
    }

    // Promote user to admin in profiles
    try {
      const adminClient = createAdminClient();
      const { error } = await adminClient
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id);

      if (error) {
        console.warn('Admin update error in profiles:', error);
      }
    } catch (e: any) {
      console.warn('Could not run adminClient update:', e?.message);
    }

    revalidatePath('/admin', 'layout');
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || 'Failed to authorize admin access' };
  }
}
