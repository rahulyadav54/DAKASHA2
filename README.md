
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

To deploy this project to Vercel:

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Final submission for AI Hackathon"
   git branch -M main
   git remote add origin https://github.com/rahulyadav54/Ai_hackathon.git
   git push -u origin main
   ```

2. **Configure Vercel**:
   - Link your repo in the Vercel dashboard.
   - **Environment Variables**: Add `GOOGLE_GENAI_API_KEY` with your Gemini key from [Google AI Studio](https://aistudio.google.com/).

## ⚠️ Troubleshooting (Crucial)

### Login Errors ("Identity Toolkit API" or "Blocked")
If you enabled the providers and API but still see errors:

1. **Clear Browser Cache**: Or try an **Incognito window**.
2. **Authorized Domains**: Go to [Firebase Authentication > Settings > Authorized Domains](https://console.firebase.google.com/project/ramiyaa-ff272/authentication/settings) and ensure `localhost` is listed.
3. **Propagation Time**: Google Cloud changes can take up to 5 minutes to take effect.
4. **Project ID Mismatch**: Double check that the project ID in `src/firebase/config.ts` matches the project where you enabled the API.

### AI Not Responding
- Ensure the `GOOGLE_GENAI_API_KEY` is added to your Vercel environment variables.

### Missing or insufficient permissions (Firestore)
- Ensure your `firestore.rules` in the Firebase Console matches the rules in this project.
