    -- Function to automatically create profile when user signs up
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, credits, subscription_status, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    50, -- 50 free credits to test the platform
    'inactive',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
    END;
    $$;

    -- Trigger to call the function when a new user is created
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

    -- Backfill: Create profiles for existing users without profiles
INSERT INTO public.profiles (id, email, full_name, credits, subscription_status, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  50, -- 50 free credits to test the platform
  'inactive',
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

