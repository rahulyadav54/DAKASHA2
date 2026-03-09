
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

### "Identity Toolkit API has not been used" OR "Blocked"
If you see login errors, you MUST perform these two steps in order:

1. **Enable the API**: [Click here to Enable Identity Toolkit API](https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=ramiyaa-ff272).
2. **Enable Email/Password Provider**: 
   - Go to the [Firebase Console Authentication Tab](https://console.firebase.google.com/project/ramiyaa-ff272/authentication/providers).
   - Click **"Add new provider"**.
   - Select **"Email/Password"**.
   - Enable it and click **"Save"**.

### "Missing or insufficient permissions"
- Ensure your `firestore.rules` in the Firebase Console matches the rules in this project.

### AI Not Responding
- Ensure the `GOOGLE_GENAI_API_KEY` is added to your Vercel environment variables.

## 🏆 Hackathon Submission
This project provides a comprehensive AI tutoring solution focused on accessibility, personalization, and modern learning techniques.
