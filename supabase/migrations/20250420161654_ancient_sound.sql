/*
  # Add courses feature tables

  1. New Tables
     - `learning_tracks`: Store learning track information
     - `courses`: Store course information for each track
     - `user_course_progress`: Track user progress in courses

  2. Security
     - Enable RLS on all tables
     - Add policies for authenticated users
     - Add policies for public read access to tracks and courses
*/

-- Learning Tracks Table
CREATE TABLE IF NOT EXISTS learning_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES learning_tracks(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_hours INTEGER NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Course Progress Table
CREATE TABLE IF NOT EXISTS user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  status TEXT NOT NULL CHECK (status IN ('Not Started', 'In Progress', 'Completed')),
  progress_percentage INTEGER NOT NULL CHECK (progress_percentage BETWEEN 0 AND 100),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_learning_tracks_title ON learning_tracks(title);
CREATE INDEX IF NOT EXISTS idx_courses_track_id ON courses(track_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_course ON user_course_progress(user_id, course_id);

-- Enable Row Level Security
ALTER TABLE learning_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;

-- Security Policies

-- Learning Tracks Policies
CREATE POLICY "Anyone can read tracks"
  ON learning_tracks
  FOR SELECT
  USING (true);

-- Courses Policies
CREATE POLICY "Anyone can read courses"
  ON courses
  FOR SELECT
  USING (true);

-- User Course Progress Policies
CREATE POLICY "Users can read their own progress"
  ON user_course_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
  ON user_course_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_course_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Seed initial data
INSERT INTO learning_tracks (id, title, description) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'System Engineer Track', 'Comprehensive track for aspiring system engineers covering system design, backend development, and more.'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Full Stack Developer Track', 'Complete journey to becoming a full stack developer with frontend, backend, and DevOps skills.');

INSERT INTO courses (track_id, title, description, duration_hours, difficulty) VALUES
  -- System Engineer Track
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'System Design', 'Learn to design scalable systems and architectures', 20, 'Intermediate'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Backend Development', 'Master backend development with modern technologies', 30, 'Advanced'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Frontend Development', 'Essential frontend skills for system engineers', 25, 'Intermediate'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Database Design', 'Fundamentals of database design and management', 15, 'Beginner'),
  
  -- Full Stack Developer Track
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Frontend Development', 'Complete frontend development with modern frameworks', 25, 'Intermediate'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Backend Development', 'Backend development with Node.js and Express', 30, 'Intermediate'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Database Management', 'Database design and management for full stack apps', 20, 'Intermediate'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'DevOps Essentials', 'Essential DevOps practices and tools', 20, 'Advanced');