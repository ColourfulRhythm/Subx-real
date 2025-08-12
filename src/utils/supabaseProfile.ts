import { supabase } from '../services/supabaseClient';

export async function ensureSupabaseUserProfile(fullName?: string, phone?: string, nin?: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) return;
  try {
    await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || ''}/create_user_profile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ full_name: fullName, phone, nin })
    });
  } catch (_) {
    // no-op; soft fail
  }
}
