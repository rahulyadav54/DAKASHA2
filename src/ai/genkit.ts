
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Initializes Genkit with the Google AI plugin.
 * It uses the API key provided in the environment variables.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
