-- FitTracker Pro Supabase Schema
-- Run in Supabase SQL Editor to create tables + RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Training Records
-- ============================================
CREATE TABLE training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  local_id TEXT NOT NULL,
  body_part TEXT NOT NULL,
  exercises JSONB NOT NULL,
  duration INTEGER DEFAULT 0,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted BOOLEAN DEFAULT false,
  UNIQUE(user_id, local_id)
);

-- ============================================
-- Body Records (weight, body fat, diet)
-- ============================================
CREATE TABLE body_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  local_id TEXT NOT NULL,
  weight NUMERIC,
  body_fat NUMERIC,
  diet TEXT,
  notes TEXT,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted BOOLEAN DEFAULT false,
  UNIQUE(user_id, local_id)
);

-- ============================================
-- Custom Exercises
-- ============================================
CREATE TABLE custom_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  local_id TEXT NOT NULL,
  name TEXT NOT NULL,
  default_sets INTEGER,
  default_reps INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted BOOLEAN DEFAULT false,
  UNIQUE(user_id, local_id)
);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_exercises ENABLE ROW LEVEL SECURITY;

-- Training records policies
CREATE POLICY "Users can view own training records"
  ON training_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training records"
  ON training_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training records"
  ON training_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own training records"
  ON training_records FOR DELETE
  USING (auth.uid() = user_id);

-- Body records policies
CREATE POLICY "Users can view own body records"
  ON body_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own body records"
  ON body_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own body records"
  ON body_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own body records"
  ON body_records FOR DELETE
  USING (auth.uid() = user_id);

-- Custom exercises policies
CREATE POLICY "Users can view own custom exercises"
  ON custom_exercises FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom exercises"
  ON custom_exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom exercises"
  ON custom_exercises FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom exercises"
  ON custom_exercises FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Index for performance
-- ============================================
CREATE INDEX idx_training_user_date ON training_records(user_id, date);
CREATE INDEX idx_body_user_date ON body_records(user_id, date);
CREATE INDEX idx_custom_exercises_user ON custom_exercises(user_id);
