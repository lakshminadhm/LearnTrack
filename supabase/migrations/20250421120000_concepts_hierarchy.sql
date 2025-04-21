-- Migration to create concepts table and track user concept completion

-- Create concepts table
CREATE TABLE IF NOT EXISTS concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    resource_links TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_concepts_parent_id ON concepts(parent_id);
CREATE INDEX IF NOT EXISTS idx_concepts_course_id ON concepts(course_id);

-- Create user_concept_progress table to track user completion of concepts
CREATE TABLE IF NOT EXISTS user_concept_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, concept_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_concept_progress_user_id ON user_concept_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_concept_progress_concept_id ON user_concept_progress(concept_id);

-- Insert sample data for concepts
INSERT INTO concepts (course_id, name, description, resource_links) VALUES
  ('d808f186-5e53-4875-9721-5a295633613e', 'HTML Basics', 'Learn the structure of web pages', ARRAY['https://developer.mozilla.org/en-US/docs/Web/HTML']),
  ('d808f186-5e53-4875-9721-5a295633613e', 'HTML5 Features', 'Explore new features in HTML5', ARRAY['https://developer.mozilla.org/en-US/docs/Web/HTML/HTML5']),
  ('d808f186-5e53-4875-9721-5a295633613e', 'CSS Basics', 'Learn how to style web pages', ARRAY['https://developer.mozilla.org/en-US/docs/Web/CSS']),
  ('d808f186-5e53-4875-9721-5a295633613e', 'CSS Grid', 'Master layout techniques with CSS Grid', ARRAY['https://css-tricks.com/snippets/css/complete-guide-grid/']),
  ('d808f186-5e53-4875-9721-5a295633613e', 'React Components', 'Understand the building blocks of React', ARRAY['https://reactjs.org/docs/components-and-props.html']),
  ('d808f186-5e53-4875-9721-5a295633613e', 'React State Management', 'Learn how to manage state in React apps', ARRAY['https://reactjs.org/docs/state-and-lifecycle.html']);

-- Insert sample data for user_concept_progress
INSERT INTO user_concept_progress (user_id, concept_id, is_completed, completed_at) VALUES
  ('c37cbe6f-6488-4d97-9737-c94e0d3f4d93', '2e78a662-f80b-4cc4-9d98-f253a0a309c4', TRUE, '2025-04-20T10:00:00Z'),
  ('c37cbe6f-6488-4d97-9737-c94e0d3f4d93', '9085c40f-e1a1-446e-8f6e-c1a88d53a66b', TRUE, '2025-04-20T12:00:00Z');