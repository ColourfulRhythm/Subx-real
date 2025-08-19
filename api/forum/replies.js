import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://hclguhbswctxfahhzrrr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2NTY4NywiZXhwIjoyMDcwMzQxNjg3fQ.ai07Fz6gadARMscOv8WzWvL-PX5F-tKHP5ZFyym27i0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { topic_id } = req.query;

      if (!topic_id) {
        return res.status(400).json({ error: 'Topic ID is required' });
      }

      // Fetch replies for a specific topic
      const { data: replies, error } = await supabase
        .from('forum_replies')
        .select(`
          *,
          users!inner(full_name, email)
        `)
        .eq('topic_id', topic_id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching replies:', error);
        return res.status(500).json({ error: 'Failed to fetch replies' });
      }

      res.json({ success: true, replies });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { content, topic_id, user_id } = req.body;

      if (!content || !topic_id || !user_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create new reply
      const { data: reply, error } = await supabase
        .from('forum_replies')
        .insert({
          content,
          topic_id,
          user_id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reply:', error);
        return res.status(500).json({ error: 'Failed to create reply' });
      }

      res.json({ success: true, reply });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
