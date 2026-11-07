import { supabase } from '@/lib/supabase';

export async function joinWaitlist(email: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('waitlist').insert({ email, source: 'landing_page' });
  if (error) {
    if (error.code === '23505') return { success: false, error: 'Already on the waitlist!' };
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
  return { success: true };
}
