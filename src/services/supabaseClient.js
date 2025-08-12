import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hclguhbswctxfahhzrrr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NjU2ODcsImV4cCI6MjA3MDM0MTY4N30.y2ILgUZLd_pJ9rAuRVGTHIIkh1sfhvXRnRlCt4DUzyQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
