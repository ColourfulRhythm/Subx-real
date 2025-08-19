import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://hclguhbswctxfahhzrrr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2NTY4NywiZXhwIjoyMDcwMzQxNjg3fQ.ai07Fz6gadARMscOv8WzWvL-PX5F-tKHP5ZFyym27i0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Fetch all forum topics with user information
      const { data: topics, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          users!inner(full_name, email),
          forum_replies(count)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching topics:', error);
        return res.status(500).json({ error: 'Failed to fetch topics' });
      }

      res.json({ success: true, topics });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, content, category, user_id } = req.body;

      if (!title || !content || !user_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create new topic
      const { data: topic, error } = await supabase
        .from('forum_topics')
        .insert({
          title,
          content,
          category: category || 'general',
          user_id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating topic:', error);
        return res.status(500).json({ error: 'Failed to create topic' });
      }

      res.json({ success: true, topic });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
