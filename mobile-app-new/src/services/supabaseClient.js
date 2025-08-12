import { createClient } from '@supabase/supabase-js';

// Supabase configuration for mobile app
const supabaseUrl = 'https://hclguhbswctxfahhzrrr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NjU2ODcsImV4cCI6MjA3MDM0MTY4N30.y2ILgUZLd_pJ9rAuRVGTHIIkh1sfhvXRnRlCt4DUzyQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Firebase-compatible auth interface for mobile app
export const mobileAuth = {
  currentUser: null,
  
  async signInWithEmailAndPassword(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      this.currentUser = data.user;
      return { user: data.user };
    } catch (error) {
      throw error;
    }
  },
  
  async createUserWithEmailAndPassword(email, password, displayName) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: displayName }
        }
      });
      
      if (error) throw error;
      
      this.currentUser = data.user;
      return { user: data.user };
    } catch (error) {
      throw error;
    }
  },
  
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      this.currentUser = null;
    } catch (error) {
      throw error;
    }
  },
  
  async sendPasswordResetEmail(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  },
  
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null;
      callback(this.currentUser);
    });
  }
};

// Firebase-compatible database interface
export const mobileDb = {
  collection: (name) => ({
    doc: (id) => ({
      set: async (data) => {
        const { error } = await supabase
          .from(name)
          .upsert({ id, ...data });
        if (error) throw error;
        return { id };
      },
      get: async () => {
        const { data, error } = await supabase
          .from(name)
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        return { exists: !!data, data: () => data };
      }
    })
  })
};

// Firebase-compatible storage interface
export const mobileStorage = {
  ref: (path) => ({
    put: async (file) => {
      const { error } = await supabase.storage
        .from('documents')
        .upload(path, file);
      if (error) throw error;
      return { ref: { fullPath: path } };
    },
    getDownloadURL: async () => {
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(path);
      return publicUrl;
    }
  })
};
