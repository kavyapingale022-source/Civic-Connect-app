-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('citizen', 'authority', 'admin');

-- Create enum for issue status
CREATE TYPE issue_status AS ENUM ('submitted', 'in_progress', 'resolved');

-- Create enum for issue category
CREATE TYPE issue_category AS ENUM ('road_pothole', 'water_supply', 'garbage', 'streetlight', 'sanitation', 'other');

-- Create enum for department
CREATE TYPE department AS ENUM ('road', 'water', 'sanitation', 'electrical', 'general');

-- Profiles table for all users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'citizen',
  department department,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issues table
CREATE TABLE IF NOT EXISTS public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_authority_id UUID REFERENCES public.profiles(id),
  category issue_category NOT NULL,
  description TEXT NOT NULL,
  photo_urls TEXT[] DEFAULT '{}',
  audio_url TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  status issue_status DEFAULT 'submitted',
  priority INTEGER DEFAULT 1,
  completion_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Status logs for tracking issue progress
CREATE TABLE IF NOT EXISTS public.status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  old_status issue_status,
  new_status issue_status NOT NULL,
  remarks TEXT,
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
