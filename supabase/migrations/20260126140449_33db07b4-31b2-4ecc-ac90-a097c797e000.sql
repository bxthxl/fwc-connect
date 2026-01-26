-- Make phone optional (remove NOT NULL constraint)
ALTER TABLE public.profiles 
  ALTER COLUMN phone DROP NOT NULL;

-- Make email required (add NOT NULL constraint)  
-- First set a default for any existing null emails
UPDATE public.profiles SET email = 'placeholder@temp.com' WHERE email IS NULL;
ALTER TABLE public.profiles 
  ALTER COLUMN email SET NOT NULL;

-- Drop unique constraint from phone if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_phone_key;

-- Add unique constraint on email
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);