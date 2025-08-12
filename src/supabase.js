import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hclguhbswctxfahhzrrr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Site URL for redirects (replace with your actual domain)
const siteUrl = import.meta.env.VITE_SITE_URL || 'https://your-actual-domain.com';

// Create Supabase client with auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Set the redirect URL for email verification
    redirectTo: `${siteUrl}/dashboard/investor`
  }
});

// Export as default for backward compatibility
export default supabase;