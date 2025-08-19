import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL || 'https://hclguhbswctxfahhzrrr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2NTY4NywiZXhwIjoyMDcwMzQxNjg3fQ.ai07Fz6gadARMscOv8WzWvL-PX5F-tKHP5ZFyym27i0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get all forum topics
router.get('/topics', async (req, res) => {
  try {
    // Fetch all forum topics
    const { data: topics, error } = await supabase
      .from('forum_topics')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching topics:', error);
      return res.status(500).json({ error: 'Failed to fetch topics' });
    }

    // Transform the data to match expected format
    const transformedTopics = topics.map(topic => ({
      id: topic.id,
      title: topic.title,
      content: topic.content,
      category: topic.category,
      created_at: topic.created_at,
      users: { full_name: 'Anonymous User', email: 'anonymous@subx.com' },
      forum_replies: [{ count: 0 }] // Default to 0 replies for now
    }));

    res.json({ success: true, topics: transformedTopics });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new forum topic
router.post('/topics', async (req, res) => {
  try {
    const { title, content, category, user_id } = req.body;

    if (!title || !content || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create new topic in Supabase
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

    console.log('New channel created:', topic);

    res.json({ success: true, topic });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get replies for a topic
router.get('/replies', async (req, res) => {
  try {
    const { topic_id } = req.query;

    if (!topic_id) {
      return res.status(400).json({ error: 'Topic ID is required' });
    }

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
});

// Create new reply
router.post('/replies', async (req, res) => {
  try {
    const { content, topic_id, user_id } = req.body;

    if (!content || !topic_id || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

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
});

export { router as forumRouter };
