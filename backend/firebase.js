import { createClient } from '@supabase/supabase-js';

// Supabase service role client for backend operations
const supabaseUrl = process.env.SUPABASE_URL || 'https://hclguhbswctxfahhzrrr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required for backend operations');
  process.exit(1);
}

// Create Supabase client with service role (full access)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Export for backward compatibility
export const auth = {
  // Supabase JWT verification function
  verifyIdToken: async (token) => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error) throw error;
      
      // Return in Firebase-compatible format
      return {
        uid: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'user'
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
};

console.log('Supabase backend client initialized successfully');