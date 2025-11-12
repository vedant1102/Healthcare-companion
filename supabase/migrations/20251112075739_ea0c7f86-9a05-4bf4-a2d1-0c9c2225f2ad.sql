-- Create symptom categories table
CREATE TABLE public.symptom_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create symptoms table
CREATE TABLE public.symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.symptom_categories(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user symptoms log table
CREATE TABLE public.user_symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_ids UUID[] NOT NULL,
  severity INTEGER CHECK (severity >= 1 AND severity <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create AI diagnoses table
CREATE TABLE public.ai_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_log_id UUID REFERENCES public.user_symptoms(id) ON DELETE CASCADE,
  diagnosis TEXT NOT NULL,
  recommendations TEXT,
  medicines TEXT[],
  home_remedies TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.symptom_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for symptom_categories (public read)
CREATE POLICY "Symptom categories are viewable by everyone"
ON public.symptom_categories FOR SELECT
USING (true);

-- RLS Policies for symptoms (public read)
CREATE POLICY "Symptoms are viewable by everyone"
ON public.symptoms FOR SELECT
USING (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- RLS Policies for user_symptoms
CREATE POLICY "Users can view their own symptoms"
ON public.user_symptoms FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own symptoms"
ON public.user_symptoms FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own symptoms"
ON public.user_symptoms FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symptoms"
ON public.user_symptoms FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for ai_diagnoses
CREATE POLICY "Users can view their own diagnoses"
ON public.ai_diagnoses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diagnoses"
ON public.ai_diagnoses FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view their own messages"
ON public.chat_messages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
ON public.chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Insert common symptom categories
INSERT INTO public.symptom_categories (name, icon) VALUES
  ('General', '🌡️'),
  ('Respiratory', '🫁'),
  ('Digestive', '🍽️'),
  ('Neurological', '🧠'),
  ('Musculoskeletal', '💪'),
  ('Cardiovascular', '❤️'),
  ('Skin', '🩹');

-- Insert common symptoms
INSERT INTO public.symptoms (name, description, category_id) VALUES
  ('Fever', 'Elevated body temperature', (SELECT id FROM public.symptom_categories WHERE name = 'General')),
  ('Fatigue', 'Persistent tiredness or exhaustion', (SELECT id FROM public.symptom_categories WHERE name = 'General')),
  ('Cough', 'Persistent coughing', (SELECT id FROM public.symptom_categories WHERE name = 'Respiratory')),
  ('Sore Throat', 'Pain or irritation in the throat', (SELECT id FROM public.symptom_categories WHERE name = 'Respiratory')),
  ('Shortness of Breath', 'Difficulty breathing', (SELECT id FROM public.symptom_categories WHERE name = 'Respiratory')),
  ('Nausea', 'Feeling of sickness with urge to vomit', (SELECT id FROM public.symptom_categories WHERE name = 'Digestive')),
  ('Stomach Pain', 'Abdominal discomfort or pain', (SELECT id FROM public.symptom_categories WHERE name = 'Digestive')),
  ('Headache', 'Pain in the head or upper neck', (SELECT id FROM public.symptom_categories WHERE name = 'Neurological')),
  ('Dizziness', 'Feeling of lightheadedness', (SELECT id FROM public.symptom_categories WHERE name = 'Neurological')),
  ('Body Aches', 'General muscle or joint pain', (SELECT id FROM public.symptom_categories WHERE name = 'Musculoskeletal')),
  ('Chest Pain', 'Pain or discomfort in the chest', (SELECT id FROM public.symptom_categories WHERE name = 'Cardiovascular')),
  ('Rash', 'Skin irritation or inflammation', (SELECT id FROM public.symptom_categories WHERE name = 'Skin'));