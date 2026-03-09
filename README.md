# SmartRead AI Tutor 🚀

SmartRead AI is an advanced reading comprehension and adaptive learning platform. It transforms static text and PDF documents into interactive, personalized learning experiences.

## ✨ Features

- **AI Question Generation**: Automatically creates MCQs, Short Answer, True/False, and Fill-in-the-blank questions.
- **Customizable Assessments**: Set your own **Timer** and **Total Marks** before starting.
- **Semantic Answer Evaluation**: Uses Gemini AI to understand the meaning of student answers.
- **AI Study Tutor**: A persistent conversational assistant that helps explain complex concepts.
- **Study Tools**: Generates comprehensive Study Guides and Flashcard sets automatically.
- **Dashboard & Analytics**: Track progress and performance over time.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI Engine**: Google Gemini (via Genkit)
- **Database & Auth**: Firebase (Firestore & Firebase Auth)
- **Styling**: Tailwind CSS & Shadcn UI

## 🚀 Deployment to Vercel

To deploy this project to Vercel, follow these steps:

### 1. Push to GitHub
Open your terminal in the project root and run:
```bash
git init
git add .
git commit -m "Ready for Vercel deployment"
git branch -M main
git remote add origin https://github.com/rahulyadav54/Ai_hackathon.git
git push -u origin main
```

### 2. Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** > **"Project"**.
3. Import your `Ai_hackathon` repository.
4. **Important**: Under "Environment Variables", add:
   - `GOOGLE_GENAI_API_KEY`: [Your Gemini API Key]
5. Click **"Deploy"**.

## 🏆 Hackathon Project
This project was developed as a comprehensive AI tutoring solution, focusing on accessibility, personalization, and modern pedagogical techniques.
