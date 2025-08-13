import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hclguhbswctxfahhzrrr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Site URL for redirects (replace with your actual domain)
const siteUrl = import.meta.env.VITE_SITE_URL || 'https://subxhq.com';

console.log('Supabase client initialization:');
console.log('URL:', supabaseUrl);
console.log('Key present:', !!supabaseAnonKey);
console.log('Site URL:', siteUrl);

// Create Supabase client with auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Set the redirect URL for email verification
    redirectTo: `${siteUrl}/verify`
  }
});

console.log('Supabase client created successfully');

// Export as default for backward compatibility
export default supabase;