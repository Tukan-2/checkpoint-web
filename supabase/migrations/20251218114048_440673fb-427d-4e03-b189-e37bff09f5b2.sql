-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Admin policies for branches (CRUD)
CREATE POLICY "Admins can manage branches" ON public.branches
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for branch_vehicle_groups
CREATE POLICY "Admins can manage branch vehicle groups" ON public.branch_vehicle_groups
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for branch_prices
CREATE POLICY "Admins can manage branch prices" ON public.branch_prices
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for vehicle_groups
CREATE POLICY "Admins can manage vehicle groups" ON public.vehicle_groups
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for bookings
CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bookings" ON public.bookings
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bookings" ON public.bookings
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));