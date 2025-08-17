-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE user_role AS ENUM ('investor', 'developer', 'admin');
CREATE TYPE investment_status AS ENUM ('pending', 'active', 'completed', 'approved', 'rejected');
CREATE TYPE transaction_status AS ENUM ('pending', 'successful', 'failed', 'cancelled');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'investor',
  profile_image_url TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Nigeria',
  postal_code TEXT,
  kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_documents JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  total_investments DECIMAL(15,2) DEFAULT 0,
  total_properties INTEGER DEFAULT 0
);

-- Properties table
CREATE TABLE public.properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  location_geojson JSONB,
  total_sqm DECIMAL(10,2) NOT NULL,
  available_sqm DECIMAL(10,2) NOT NULL,
  price_per_sqm DECIMAL(15,2) NOT NULL,
  developer_id UUID REFERENCES public.users(id),
  project_status TEXT DEFAULT 'active',
  images TEXT[],
  documents TEXT[],
  amenities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ownership units table
CREATE TABLE public.ownership_units (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.users(id),
  size_sqm DECIMAL(10,2) NOT NULL,
  purchase_price DECIMAL(15,2) NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status investment_status DEFAULT 'active',
  deed_url TEXT,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  property_id UUID REFERENCES public.properties(id),
  ownership_unit_id UUID REFERENCES public.ownership_units(id),
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  payment_reference TEXT UNIQUE NOT NULL,
  payment_method TEXT DEFAULT 'paystack',
  status transaction_status DEFAULT 'pending',
  paystack_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  property_id UUID REFERENCES public.properties(id),
  ownership_unit_id UUID REFERENCES public.ownership_units(id),
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resale listings table
CREATE TABLE public.resale_listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ownership_unit_id UUID REFERENCES public.ownership_units(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.users(id),
  asking_price DECIMAL(15,2) NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum categories table
CREATE TABLE public.forum_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum topics table
CREATE TABLE public.forum_topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum replies table
CREATE TABLE public.forum_replies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.users(id),
  content TEXT NOT NULL,
  parent_reply_id UUID REFERENCES public.forum_replies(id),
  is_solution BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default forum categories
INSERT INTO public.forum_categories (name, description, slug) VALUES
('General Discussion', 'General topics about property investment', 'general'),
('Investment Strategies', 'Share and discuss investment strategies', 'strategies'),
('Market Updates', 'Latest market news and updates', 'market'),
('Legal & Compliance', 'Legal questions and compliance issues', 'legal'),
('Success Stories', 'Share your investment success stories', 'success');

-- Insert Plot 77 property
INSERT INTO public.properties (id, name, description, location, total_sqm, available_sqm, price_per_sqm, project_status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Plot 77', 'Premium residential plot in prime location', 'Lagos, Nigeria', 1000, 951, 500000, 'active');

-- Insert existing users and their investments
INSERT INTO public.users (id, email, full_name, role, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'chrixonuoha@gmail.com', 'Christopher Onuoha', 'investor', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'kingkwaoyama@gmail.com', 'Kingkwa Enang Oyama', 'investor', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'mary.stella82@yahoo.com', 'Iwuozor Chika', 'investor', NOW());

-- Insert their investments
INSERT INTO public.ownership_units (property_id, owner_id, size_sqm, purchase_price, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 7, 3500000, 'active'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 35, 17500000, 'active'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 7, 3500000, 'active');

-- Update available sqm for Plot 77
UPDATE public.properties SET available_sqm = 951 WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Create function to finalize purchase
CREATE OR REPLACE FUNCTION finalize_purchase(p_payment_ref TEXT)
RETURNS VOID AS $$
DECLARE
  v_transaction RECORD;
  v_property RECORD;
  v_ownership_unit_id UUID;
BEGIN
  -- Get transaction details
  SELECT * INTO v_transaction FROM public.transactions WHERE payment_reference = p_payment_ref;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;
  
  -- Get property details
  SELECT * INTO v_property FROM public.properties WHERE id = v_transaction.property_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property not found';
  END IF;
  
  -- Check if enough sqm available
  IF v_property.available_sqm < v_transaction.amount / v_property.price_per_sqm THEN
    RAISE EXCEPTION 'Insufficient sqm available';
  END IF;
  
  -- Create ownership unit
  INSERT INTO public.ownership_units (property_id, owner_id, size_sqm, purchase_price, status)
  VALUES (v_transaction.property_id, v_transaction.user_id, 
          v_transaction.amount / v_property.price_per_sqm, v_transaction.amount, 'active')
  RETURNING id INTO v_ownership_unit_id;
  
  -- Update transaction with ownership unit
  UPDATE public.transactions SET 
    ownership_unit_id = v_ownership_unit_id,
    status = 'successful'
  WHERE id = v_transaction.id;
  
  -- Update property available sqm
  UPDATE public.properties SET 
    available_sqm = available_sqm - (v_transaction.amount / v_property.price_per_sqm)
  WHERE id = v_transaction.property_id;
  
  -- Update user total investments
  UPDATE public.users SET 
    total_investments = total_investments + v_transaction.amount,
    total_properties = total_properties + 1
  WHERE id = v_transaction.user_id;
  
  -- Update ownership unit with transaction reference
  UPDATE public.ownership_units SET 
    id = v_ownership_unit_id
  WHERE id = v_ownership_unit_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get available spots count
CREATE OR REPLACE FUNCTION get_available_spots()
RETURNS INTEGER AS $$
BEGIN
  RETURN 10000 - (SELECT COUNT(*) FROM public.users WHERE role = 'investor');
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ownership_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view properties" ON public.properties
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own ownership units" ON public.ownership_units
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view forum topics" ON public.forum_topics
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create forum topics" ON public.forum_topics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view forum replies" ON public.forum_replies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create forum replies" ON public.forum_replies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_ownership_units_owner_id ON public.ownership_units(owner_id);
CREATE INDEX idx_ownership_units_property_id ON public.ownership_units(property_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_payment_reference ON public.transactions(payment_reference);
CREATE INDEX idx_forum_topics_category_id ON public.forum_topics(category_id);
CREATE INDEX idx_forum_replies_topic_id ON public.forum_replies(topic_id);
