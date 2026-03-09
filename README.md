
# SmartRead AI Tutor 🚀

SmartRead AI is an advanced reading comprehension and adaptive learning platform. It transforms static text and PDF documents into interactive, personalized learning experiences using Google's Gemini AI.

## ✨ Features

- **AI Question Generation**: Automatically creates MCQs, Short Answer, True/False, and Fill-in-the-blank questions.
- **Customizable Assessments**: Set your own **Timer** and **Total Marks** before starting.
- **Semantic Answer Evaluation**: Uses Gemini AI to understand the meaning of student answers.
- **AI Study Tutor**: A persistent conversational assistant that helps explain complex concepts.
- **Study Tools**: Generates comprehensive Study Guides and Flashcard sets automatically.
- **Dashboard & Analytics**: Track progress and performance over time.

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

## ⚠️ Troubleshooting Login Errors

If you see a "Blocked" error or "Identity Toolkit API" error during login:

### 1. Enable Identity Toolkit API (GCP Console)
You must enable this API in the **Google Cloud Console**, not just Firebase:
[Enable Identity Toolkit API](https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=ramiyaa-ff272)

### 2. Check API Key Restrictions
Google Cloud might be restricting your API key.
- Go to [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials?project=ramiyaa-ff272).
- Click on the API key used in `src/firebase/config.ts` (ends in `HrFU`).
- Set **API restrictions** to **"Don't restrict key"** or add **"Identity Toolkit API"** to the list of allowed APIs.

### 3. Enable Sign-in Providers (Firebase Console)
- Go to [Firebase Authentication > Sign-in method](https://console.firebase.google.com/project/ramiyaa-ff272/authentication/providers).
- Enable **Email/Password** and/or **Google**.

### 4. Wait for Propagation
Google Cloud changes can take up to 5 minutes to take effect. If it still doesn't work, try in an **Incognito window**.
