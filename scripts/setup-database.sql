-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create saved_models table
CREATE TABLE IF NOT EXISTS saved_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  prompt TEXT NOT NULL,
  model_url TEXT NOT NULL,
  quality VARCHAR(50) DEFAULT 'medium',
  format VARCHAR(50) DEFAULT 'glb',
  thumbnail_url TEXT,
  description TEXT,
  tags VARCHAR(255),
  is_public BOOLEAN DEFAULT false,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_models_user_id ON saved_models(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_models_created_at ON saved_models(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_models_is_public ON saved_models(is_public);

-- Create model_likes table for tracking likes
CREATE TABLE IF NOT EXISTS model_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES saved_models(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, model_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Create RLS policies for saved_models table
CREATE POLICY "Users can view own models" ON saved_models
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create models" ON saved_models
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own models" ON saved_models
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own models" ON saved_models
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- Create RLS policies for model_likes table
CREATE POLICY "Users can view likes" ON model_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can create likes" ON model_likes
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own likes" ON model_likes
  FOR DELETE USING (user_id::text = auth.uid()::text);
