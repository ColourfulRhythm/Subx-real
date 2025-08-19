-- CORRECTED Supabase Schema for Subx Application
-- Only includes REAL plots: Plot 77, Plot 79, Plot 81, Plot 84, Plot 87
-- Removes unwanted sample data like Kobape Gardens and Victoria Island

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  total_sqm INTEGER NOT NULL,
  price_per_sqm DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  amenities TEXT[],
  image_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  sqm_purchased INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_reference VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_topics table
CREATE TABLE IF NOT EXISTS forum_topics (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER REFERENCES forum_topics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  bio TEXT,
  investment_interests TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert ONLY REAL plot data (no sample data)
INSERT INTO projects (title, description, location, total_sqm, price_per_sqm, amenities, image_urls) VALUES
('2 Seasons - Plot 77', 'Premium residential plot in 2 Seasons Estate', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 500, 5000.00, ARRAY['Road access', 'Security', 'Drainage'], ARRAY['/2-seasons/2seasons-logo.jpg']),
('2 Seasons - Plot 79', 'Exclusive residential', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 500, 5000.00, ARRAY['Road access', 'Security', 'Drainage', 'Lakefront'], ARRAY['/2-seasons/2seasons-logo.jpg']),
('2 Seasons - Plot 81', 'Premium plot in the wellness village with spa access', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 500, 5000.00, ARRAY['Road access', 'Security', 'Drainage', 'Wellness center', 'Spa access'], ARRAY['/2-seasons/2seasons-logo.jpg']),
('2 Seasons - Plot 84', 'Family-oriented plot near community facilities', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 500, 5000.00, ARRAY['Road access', 'Security', 'Drainage', 'Community center', 'Playground'], ARRAY['/2-seasons/2seasons-logo.jpg']),
('2 Seasons - Plot 87', 'Executive plot with premium amenities', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 500, 5000.00, ARRAY['Road access', 'Security', 'Drainage', 'Executive lounge', 'Premium parking'], ARRAY['/2-seasons/2seasons-logo.jpg'])
ON CONFLICT (id) DO NOTHING;

-- Insert ONLY real investments for existing users (Plot 77 only)
INSERT INTO investments (user_id, project_id, sqm_purchased, amount, status, payment_reference, created_at)
SELECT '00000000-0000-0000-0000-000000000001', 1, 7, 35000.00, 'completed', 'CHRIS_ONUOHA_001', NOW()
WHERE NOT EXISTS (SELECT 1 FROM investments WHERE user_id = '00000000-0000-0000-0000-000000000001' AND project_id = 1);

INSERT INTO investments (user_id, project_id, sqm_purchased, amount, status, payment_reference, created_at)
SELECT '00000000-0000-0000-0000-000000000002', 1, 35, 175000.00, 'completed', 'KINGKWA_OYAMA_001', NOW()
WHERE NOT EXISTS (SELECT 1 FROM investments WHERE user_id = '00000000-0000-0000-0000-000000000002' AND project_id = 1);

INSERT INTO investments (user_id, project_id, sqm_purchased, amount, status, payment_reference, created_at)
SELECT '00000000-0000-0000-0000-000000000003', 1, 7, 35000.00, 'completed', 'IWUOZOR_CHIKA_001', NOW()
WHERE NOT EXISTS (SELECT 1 FROM investments WHERE user_id = '00000000-0000-0000-0000-000000000003' AND project_id = 1);

INSERT INTO investments (user_id, project_id, sqm_purchased, amount, status, payment_reference, created_at)
SELECT '00000000-0000-0000-0000-000000000004', 1, 1, 5000.00, 'completed', 'TOLULOPE_OLUGBODE_001', NOW()
WHERE NOT EXISTS (SELECT 1 FROM investments WHERE user_id = '00000000-0000-0000-0000-000000000004' AND project_id = 1);

-- Insert forum topics (these will be linked to real users when they sign up)
INSERT INTO forum_topics (user_id, title, content, category, created_at)
SELECT NULL, 'Welcome to Subx Community!', 'Welcome to our community! Feel free to discuss real estate investment strategies, ask questions, and connect with other investors.', 'general', NOW()
WHERE NOT EXISTS (SELECT 1 FROM forum_topics WHERE title = 'Welcome to Subx Community!');

INSERT INTO forum_topics (user_id, title, content, category, created_at)
SELECT NULL, 'Investment Tips for Beginners', 'I''m new to real estate investment. Any tips for someone just starting out? What should I focus on first?', 'investment', NOW()
WHERE NOT EXISTS (SELECT 1 FROM forum_topics WHERE title = 'Investment Tips for Beginners');

INSERT INTO forum_topics (user_id, title, content, category, created_at)
SELECT NULL, 'Best Locations for Investment in 2025', 'What are your thoughts on the best locations for real estate investment this year? I''m particularly interested in emerging markets.', 'investment', NOW()
WHERE NOT EXISTS (SELECT 1 FROM forum_topics WHERE title = 'Best Locations for Investment in 2025');

INSERT INTO forum_topics (user_id, title, content, category, created_at)
SELECT NULL, 'Property Management Best Practices', 'Share your experiences and tips for managing real estate investments effectively.', 'property_management', NOW()
WHERE NOT EXISTS (SELECT 1 FROM forum_topics WHERE title = 'Property Management Best Practices');

INSERT INTO forum_topics (user_id, title, content, category, created_at)
SELECT NULL, 'Community Building', 'How can we strengthen our community and support each other in our investment goals?', 'community', NOW()
WHERE NOT EXISTS (SELECT 1 FROM forum_topics WHERE title = 'Community Building');

-- Insert forum replies (these will be linked to real users when they sign up)
INSERT INTO forum_replies (topic_id, user_id, content, created_at)
SELECT 1, NULL, 'Welcome everyone! Great to be part of this community.', NOW()
WHERE NOT EXISTS (SELECT 1 FROM forum_replies WHERE topic_id = 1 AND content = 'Welcome everyone! Great to be part of this community.');

INSERT INTO forum_replies (topic_id, user_id, content, created_at)
SELECT 1, NULL, 'Thanks for the warm welcome! Looking forward to learning from everyone.', NOW()
WHERE NOT EXISTS (SELECT 1 FROM forum_replies WHERE topic_id = 1 AND content = 'Thanks for the warm welcome! Looking forward to learning from everyone.');

INSERT INTO forum_replies (topic_id, user_id, content, created_at)
SELECT 2, NULL, 'Start with smaller investments and gradually increase as you learn.', NOW()
WHERE NOT EXISTS (SELECT 1 FROM forum_replies WHERE topic_id = 2 AND content = 'Start with smaller investments and gradually increase as you learn.');

INSERT INTO forum_replies (topic_id, user_id, content, created_at)
SELECT 3, NULL, 'I think emerging markets in Ogun State show great potential.', NOW()
WHERE NOT EXISTS (SELECT 1 FROM forum_replies WHERE topic_id = 3 AND content = 'I think emerging markets in Ogun State show great potential.');

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects (public read access)
CREATE POLICY "Projects are viewable by everyone" ON projects
  FOR SELECT USING (true);

-- Create RLS policies for investments
CREATE POLICY "Users can view their own investments" ON investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investments" ON investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for forum_topics
CREATE POLICY "Forum topics are viewable by everyone" ON forum_topics
  FOR SELECT USING (true);

CREATE POLICY "Users can create forum topics" ON forum_topics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forum topics" ON forum_topics
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for forum_replies
CREATE POLICY "Forum replies are viewable by everyone" ON forum_replies
  FOR SELECT USING (true);

CREATE POLICY "Users can create forum replies" ON forum_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forum replies" ON forum_replies
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, phone)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_project_id ON investments(project_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_user_id ON forum_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_topic_id ON forum_replies(user_id);

-- Verify the data
SELECT '=== CORRECTED SCHEMA VERIFICATION ===' as info;

SELECT 'Real Plots Created:' as status;
SELECT id, title, total_sqm, price_per_sqm FROM projects ORDER BY id;

SELECT 'Plot 77 Investments:' as status;
SELECT 
    i.sqm_purchased,
    i.amount,
    i.status
FROM investments i
WHERE i.project_id = 1;

-- Show updated available SQM projection for Plot 77
SELECT '=== PLOT 77 AVAILABLE SQM PROJECTION ===' as info;
SELECT 
    'Plot 77' as title,
    500 as total_sqm,
    SUM(sqm_purchased) as projected_purchased_sqm,
    (500 - SUM(sqm_purchased)) as projected_available_sqm
FROM temp_unverified_users;

-- Show updated co-ownership breakdown including Tolulope
SELECT '=== UPDATED PLOT 77 CO-OWNERSHIP BREAKDOWN ===' as info;
SELECT 
    full_name,
    sqm_purchased,
    amount,
    ROUND((sqm_purchased::DECIMAL / 500::DECIMAL) * 100, 1) as projected_ownership_percentage
FROM temp_unverified_users
ORDER BY amount DESC;
