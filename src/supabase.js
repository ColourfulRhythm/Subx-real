import { createClient } from '@supabase/supabase-js';

// Supabase configuration - using hardcoded values for now
const supabaseUrl = 'https://hclguhbswctxfahhzrrr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NjU2ODcsImV4cCI6MjA3MDM0MTY4N30.y2ILgUZLd_pJ9rAuRVGTHIIkh1sfhvXRnRlCt4DUzyQ';

// Site URL for redirects (replace with your actual domain)
const siteUrl = 'https://subxhq.com';

// Paystack public key fallback
const paystackKey = 'pk_live_c6e9456f9a1b1071ed96b977c21f8fae727400e0';

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

// Export Paystack key for use in components
export { paystackKey };

// Export as default for backward compatibility
export default supabase;