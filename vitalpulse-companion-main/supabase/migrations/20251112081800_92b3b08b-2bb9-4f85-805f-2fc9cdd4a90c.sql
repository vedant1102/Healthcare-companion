-- Add more symptoms to the database
INSERT INTO symptoms (name, description, category_id) VALUES
('Nausea', 'Feeling of sickness with an urge to vomit', (SELECT id FROM symptom_categories WHERE name = 'Digestive')),
('Vomiting', 'Forceful expulsion of stomach contents', (SELECT id FROM symptom_categories WHERE name = 'Digestive')),
('Diarrhea', 'Loose or watery bowel movements', (SELECT id FROM symptom_categories WHERE name = 'Digestive')),
('Constipation', 'Difficulty passing stools', (SELECT id FROM symptom_categories WHERE name = 'Digestive')),
('Bloating', 'Feeling of fullness in the abdomen', (SELECT id FROM symptom_categories WHERE name = 'Digestive')),
('Chest Pain', 'Pain or discomfort in the chest area', (SELECT id FROM symptom_categories WHERE name = 'Respiratory')),
('Shortness of Breath', 'Difficulty breathing or breathlessness', (SELECT id FROM symptom_categories WHERE name = 'Respiratory')),
('Wheezing', 'High-pitched whistling sound while breathing', (SELECT id FROM symptom_categories WHERE name = 'Respiratory')),
('Runny Nose', 'Excess nasal drainage', (SELECT id FROM symptom_categories WHERE name = 'Respiratory')),
('Sneezing', 'Sudden expulsion of air from nose and mouth', (SELECT id FROM symptom_categories WHERE name = 'Respiratory')),
('Joint Pain', 'Pain in the joints', (SELECT id FROM symptom_categories WHERE name = 'Pain')),
('Back Pain', 'Pain in the back area', (SELECT id FROM symptom_categories WHERE name = 'Pain')),
('Muscle Ache', 'Pain or soreness in muscles', (SELECT id FROM symptom_categories WHERE name = 'Pain')),
('Neck Pain', 'Pain in the neck area', (SELECT id FROM symptom_categories WHERE name = 'Pain')),
('Toothache', 'Pain in or around a tooth', (SELECT id FROM symptom_categories WHERE name = 'Pain')),
('Rash', 'Skin irritation or redness', (SELECT id FROM symptom_categories WHERE name = 'Skin')),
('Itching', 'Uncomfortable skin sensation causing desire to scratch', (SELECT id FROM symptom_categories WHERE name = 'Skin')),
('Swelling', 'Abnormal enlargement of body part', (SELECT id FROM symptom_categories WHERE name = 'General')),
('Chills', 'Feeling of coldness with shivering', (SELECT id FROM symptom_categories WHERE name = 'General')),
('Sweating', 'Excessive perspiration', (SELECT id FROM symptom_categories WHERE name = 'General')),
('Weakness', 'Lack of physical strength', (SELECT id FROM symptom_categories WHERE name = 'General')),
('Loss of Appetite', 'Reduced desire to eat', (SELECT id FROM symptom_categories WHERE name = 'Digestive')),
('Weight Loss', 'Unintentional decrease in body weight', (SELECT id FROM symptom_categories WHERE name = 'General')),
('Insomnia', 'Difficulty falling or staying asleep', (SELECT id FROM symptom_categories WHERE name = 'Neurological')),
('Anxiety', 'Feeling of worry or unease', (SELECT id FROM symptom_categories WHERE name = 'Neurological')),
('Confusion', 'Inability to think clearly', (SELECT id FROM symptom_categories WHERE name = 'Neurological')),
('Blurred Vision', 'Lack of sharpness in vision', (SELECT id FROM symptom_categories WHERE name = 'Neurological')),
('Ear Pain', 'Pain in the ear', (SELECT id FROM symptom_categories WHERE name = 'Pain')),
('Hearing Loss', 'Reduced ability to hear', (SELECT id FROM symptom_categories WHERE name = 'Neurological')),
('Numbness', 'Loss of sensation in body part', (SELECT id FROM symptom_categories WHERE name = 'Neurological'));

-- Create health_scores table for AI-powered health scoring
CREATE TABLE public.health_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  factors JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health scores"
ON public.health_scores
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health scores"
ON public.health_scores
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create badges table for gamification
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by everyone"
ON public.badges
FOR SELECT
USING (true);

-- Create user_badges table for tracking earned badges
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges"
ON public.user_badges
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
ON public.user_badges
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert default badges
INSERT INTO badges (name, description, icon, requirement_type, requirement_value) VALUES
('First Steps', 'Log your first symptom', '🎯', 'logs_count', 1),
('Getting Started', 'Log symptoms for 3 days', '⭐', 'streak_days', 3),
('Committed', 'Log symptoms for 7 days in a row', '🔥', 'streak_days', 7),
('Dedicated', 'Log symptoms for 14 days in a row', '💪', 'streak_days', 14),
('Health Champion', 'Log symptoms for 30 days in a row', '🏆', 'streak_days', 30),
('Data Collector', 'Log 10 symptom entries', '📊', 'logs_count', 10),
('Health Explorer', 'Log 25 symptom entries', '🔍', 'logs_count', 25),
('Wellness Warrior', 'Log 50 symptom entries', '⚔️', 'logs_count', 50);