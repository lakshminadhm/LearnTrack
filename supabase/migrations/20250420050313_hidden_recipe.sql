/*
  # Create initial database schema for LearnTrack

  1. New Tables
     - `users`: Store user accounts and authentication info
     - `daily_logs`: Track daily learning activities
     - `goals`: Manage learning goals and targets
     - `community_posts`: Handle community discussions and replies

  2. Security
     - Enable RLS on all tables
     - Add policies for authenticated users to access their own data
     - Add policies for community posts visibility
*/

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  username TEXT NOT NULL,
  oauth_provider TEXT,
  oauth_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Logs Table
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  technology TEXT NOT NULL,
  hours_spent NUMERIC(5,2) NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT hourly_rate_positive CHECK (hours_spent > 0)
);

-- Goals Table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  target_date DATE NOT NULL,
  technology TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Posts Table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES community_posts(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id ON daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_parent_id ON community_posts(parent_id);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Security Policies for Users
CREATE POLICY "Users can read their own data" 
  ON users 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- Security Policies for Daily Logs
CREATE POLICY "Users can CRUD their own logs" 
  ON daily_logs 
  FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Security Policies for Goals
CREATE POLICY "Users can CRUD their own goals" 
  ON goals 
  FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Security Policies for Community Posts
-- Everyone can read all posts
CREATE POLICY "Anyone can read posts" 
  ON community_posts 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Users can only create posts as themselves
CREATE POLICY "Users can create posts as themselves" 
  ON community_posts 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Users can only update/delete their own posts
CREATE POLICY "Users can update their own posts" 
  ON community_posts 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
  ON community_posts 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);