-- Migration 002: Add phone, department, employee_id, and outlet details to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '+94 77 428 1097',
ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Retail Operations',
ADD COLUMN IF NOT EXISTS employee_id TEXT DEFAULT 'SM-107',
ADD COLUMN IF NOT EXISTS outlet TEXT DEFAULT 'Fresh Store #22 • F-042';
