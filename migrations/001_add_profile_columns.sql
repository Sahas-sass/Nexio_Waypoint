-- Migration 001: Add missing columns to profiles table and configure storage
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS assigned_bay TEXT DEFAULT 'Bay 04 - Cold & Ambient',
ADD COLUMN IF NOT EXISTS station TEXT DEFAULT 'Station #04',
ADD COLUMN IF NOT EXISTS shift TEXT DEFAULT 'Morning Shift (06:00 - 14:00)',
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Storage Policies for Avatars Bucket
DO $$
BEGIN
  -- Insert avatars bucket if not exists
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
  ON CONFLICT (id) DO UPDATE SET public = true;
END $$;
