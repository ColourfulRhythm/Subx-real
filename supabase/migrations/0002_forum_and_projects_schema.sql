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

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  location TEXT NOT NULL,
  price_per_sqm DECIMAL(10,2) NOT NULL,
  total_sqm INTEGER NOT NULL,
  image_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'Available',
  description TEXT,
  amenities JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investments table if it doesn't exist
CREATE TABLE IF NOT EXISTS investments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  sqm_purchased INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  plot_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample projects data
INSERT INTO projects (title, location, price_per_sqm, total_sqm, image_url, description, amenities) VALUES
('2 Seasons - Plot 77', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 5000, 500, '/2-seasons/2seasons-logo.jpg', 'Premium residential plot in 2 Seasons Estate with world-class amenities.', '["Gated Community", "24/7 Security", "Recreation Center", "Shopping Mall"]'),
('2 Seasons - Plot 79', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 5000, 500, '/2-seasons/2seasons-logo.jpg', 'Exclusive residential plot with lakefront views and premium facilities.', '["Lakefront Views", "Wellness Center", "Sports Academy", "Content Village"]'),
('2 Seasons - Plot 81', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 5000, 500, '/2-seasons/2seasons-logo.jpg', 'Premium plot in the wellness village with spa and recreation facilities.', '["Spa & Wellness", "Fruit Forest", "Yoga Pavilion", "Juice Bars"]'),
('2 Seasons - Plot 84', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 5000, 500, '/2-seasons/2seasons-logo.jpg', 'Strategic plot with excellent connectivity and modern amenities.', '["Strategic Location", "Easy Access", "Modern Infrastructure", "Community Hub"]'),
('2 Seasons - Plot 87', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 5000, 500, '/2-seasons/2seasons-logo.jpg', 'Premium plot with panoramic views and exclusive amenities.', '["Panoramic Views", "Exclusive Access", "Premium Facilities", "Privacy"]')
ON CONFLICT (id) DO NOTHING;

-- Insert sample forum topics
INSERT INTO forum_topics (title, content, category, user_id) VALUES
('Welcome to Subx Community!', 'Welcome to our community! Feel free to discuss real estate investment strategies, ask questions, and connect with other investors.', 'general', NULL),
('Investment Tips for Beginners', 'I''m new to real estate investment. Any tips for someone just starting out? What should I focus on first?', 'investment', NULL),
('Best Locations for Investment in 2025', 'What are your thoughts on the best locations for real estate investment this year? I''m particularly interested in emerging markets.', 'investment', NULL)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

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

-- Policies for projects
CREATE POLICY "Anyone can view projects" ON projects FOR SELECT USING (true);

-- Policies for investments
CREATE POLICY "Users can view their own investments" ON investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create investments" ON investments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own investments" ON investments FOR UPDATE USING (auth.uid() = user_id);
