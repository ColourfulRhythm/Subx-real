import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hclguhbswctxfahhzrrr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin-specific functions
export const adminAuth = {
  currentUser: null,
  
  onAuthStateChange: (callback) => {
    // Initial session check
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user || null;
      adminAuth.currentUser = user ? {
        uid: user.id,
        email: user.email,
        displayName: user.user_metadata?.full_name || user.email,
        getIdToken: async () => data.session?.access_token,
      } : null;
      callback(adminAuth.currentUser);
    });

    // Listen for auth state changes
    return supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      adminAuth.currentUser = user ? {
        uid: user.id,
        email: user.email,
        displayName: user.user_metadata?.full_name || user.email,
        getIdToken: async () => session?.access_token,
      } : null;
      callback(adminAuth.currentUser);
    }).data.subscription;
  },

  signInWithEmailAndPassword: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { user: data.user };
  },

  createUserWithEmailAndPassword: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return { user: data.user };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  sendPasswordResetEmail: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }
};

export const adminDb = {
  // Replace Firestore operations with Supabase
  collection: (path) => ({
    doc: (id) => ({
      get: async () => {
        const { data, error } = await supabase
          .from(path)
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        return { data: () => data, exists: !!data };
      },
      set: async (data) => {
        const { error } = await supabase
          .from(path)
          .upsert({ id, ...data });
        if (error) throw error;
      },
      update: async (data) => {
        const { error } = await supabase
          .from(path)
          .update(data)
          .eq('id', id);
        if (error) throw error;
      },
      delete: async () => {
        const { error } = await supabase
          .from(path)
          .delete()
          .eq('id', id);
        if (error) throw error;
      }
    }),
    add: async (data) => {
      const { data: result, error } = await supabase
        .from(path)
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return { id: result.id };
    },
    where: (field, operator, value) => ({
      get: async () => {
        const { data, error } = await supabase
          .from(path)
          .select('*')
          .filter(field, operator, value);
        if (error) throw error;
        return { docs: data.map(doc => ({ data: () => doc, id: doc.id })) };
      }
    })
  })
};

export const adminStorage = {
  ref: (path) => ({
    put: async (file) => {
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(path, file);
      if (error) throw error;
      return { ref: { fullPath: data.path } };
    },
    getDownloadURL: async () => {
      const { data } = supabase.storage
        .from('documents')
        .createSignedUrl(path, 3600);
      return data?.signedUrl || '';
    }
  })
};
