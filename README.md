# SmartRead AI Tutor 🚀

SmartRead AI is an advanced reading comprehension and adaptive learning platform. It transforms static text and PDF documents into interactive, personalized learning experiences using Google's Gemini AI.

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
git commit -m "Final submission for AI Hackathon"
git branch -M main
git remote add origin https://github.com/rahulyadav54/Ai_hackathon.git
git push -u origin main
```

### 2. Configure Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** > **"Project"**.
3. Import your `Ai_hackathon` repository.
4. **Environment Variables**: This is the most important step. Add the following key:
   - **Key**: `GOOGLE_GENAI_API_KEY`
   - **Value**: [Insert your API Key from Google AI Studio]
5. Click **"Deploy"**.

## ⚠️ Troubleshooting

### "Missing or insufficient permissions"
- This usually means the Firestore rules are not deployed. Ensure your `firestore.rules` in the Firebase Console matches the one in this project.

### "Identity Toolkit API has not been used"
- If you see this in the browser console during login, you must enable the **Identity Toolkit API** in your [Google Cloud Console](https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=ramiyaa-ff272).

### AI Not Responding
- Ensure the `GOOGLE_GENAI_API_KEY` is added to your Vercel environment variables. Without this, the server-side Genkit flows will fail.

## 🏆 Hackathon Submission
This project was developed as a comprehensive AI tutoring solution, focusing on accessibility, personalization, and modern pedagogical techniques.
