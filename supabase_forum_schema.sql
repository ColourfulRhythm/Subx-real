-- Create forum_topics table
CREATE TABLE IF NOT EXISTS forum_topics (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'general',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  topic_id INTEGER REFERENCES forum_topics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample forum topics
INSERT INTO forum_topics (title, content, category, user_id) VALUES
('Welcome to Subx Community!', 'Welcome to our community! Feel free to discuss real estate investment strategies, ask questions, and connect with other investors.', 'general', NULL),
('Investment Tips for Beginners', 'I''m new to real estate investment. Any tips for someone just starting out? What should I focus on first?', 'investment', NULL),
('Best Locations for Investment in 2025', 'What are your thoughts on the best locations for real estate investment this year? I''m particularly interested in emerging markets.', 'investment', NULL),
('Property Market Trends', 'Let''s discuss the current trends in the property market. What are you seeing in your area?', 'market-analysis', NULL),
('Legal Considerations for Investors', 'What legal aspects should new investors be aware of when buying property?', 'legal', NULL)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- Policies for forum_topics
CREATE POLICY "Anyone can view forum topics" ON forum_topics FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create topics" ON forum_topics FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own topics" ON forum_topics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own topics" ON forum_topics FOR DELETE USING (auth.uid() = user_id);

-- Policies for forum_replies
CREATE POLICY "Anyone can view forum replies" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON forum_replies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own replies" ON forum_replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own replies" ON forum_replies FOR DELETE USING (auth.uid() = user_id);
