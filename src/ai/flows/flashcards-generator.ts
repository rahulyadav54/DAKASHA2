
'use server';
/**
 * @fileOverview Flow for generating flashcards from text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FlashcardsInputSchema = z.object({
  content: z.string().describe('The content to generate flashcards from.'),
});

const FlashcardsOutputSchema = z.object({
  title: z.string().describe('A title for this flashcard set.'),
  cards: z.array(z.object({
    term: z.string().describe('The concept or term.'),
    definition: z.string().describe('The explanation or definition.')
  })).describe('An array of terms and definitions.')
});

export type FlashcardsOutput = z.infer<typeof FlashcardsOutputSchema>;

export async function generateFlashcards(input: z.infer<typeof FlashcardsInputSchema>): Promise<FlashcardsOutput> {
  const prompt = ai.definePrompt({
    name: 'flashcardsPrompt',
    input: { schema: FlashcardsInputSchema },
    output: { schema: FlashcardsOutputSchema },
    prompt: `Analyze the following text and extract at least 8 key terms, concepts, or important facts. 
    Format them as flashcards with a clear 'term' and a concise 'definition'. 
    Also provide a relevant title for the set.

    Text:
    {{{content}}}`,
  });

  const { output } = await prompt(input);
  if (!output) throw new Error("Failed to generate flashcards.");
  return output;
}
