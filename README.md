# 🩺 HealthMate – AI Health Companion  

> An intelligent full-stack health tracking and AI diagnosis platform that acts like your personal doctor — securely managing your health data, analyzing symptoms, and suggesting medicines or home remedies dynamically.

---

## 🚀 Overview  

**HealthMate** is an AI-powered web application that helps users track daily health symptoms, analyze them using machine learning, and get personalized suggestions for possible conditions, medications, or natural remedies.  

It also includes a **health-focused chatbot** that gives dynamic, non-repetitive advice — acting like a digital doctor while respecting user privacy.  

---

## ✨ Key Features  

### 🧠 AI Diagnosis Engine  
- Analyzes symptoms using **OpenAI/Hugging Face models**  
- Suggests possible conditions dynamically  
- Recommends **medicines** or **home remedies** based on user preference  

### 💬 Intelligent Health Chatbot  
- Conversational, context-aware AI doctor assistant  
- Dynamic (non-hardcoded) responses  
- Focused on health, wellness, and basic treatment guidance  

### 📊 Personalized Dashboard  
- Beautiful, modern UI with health analytics  
- Interactive charts (Recharts/Chart.js) showing symptom trends  
- Displays user history, improvements, and tips  

### 🧾 Symptom Management  
- Predefined list of common symptoms  
- Option to **add custom symptoms** dynamically  
- AI analyzes custom input as well  

### 🔒 Secure Authentication  
- User login & signup using **Supabase Auth / JWT / Firebase**    
- Encrypted user data storage  

### 🕒 User History  
- Track health logs day-by-day  
- View previous diagnoses and AI suggestions  
- Export reports (PDF) for medical consultations  
2️⃣ Install Dependencies
npm install
# or
yarn install

3️⃣ Set Up Environment Variables

Create a .env file in the root folder and add:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_api_key

4️⃣ Run the Development Server
npm run dev


Then open http://localhost:3000
 in your browser.
 


