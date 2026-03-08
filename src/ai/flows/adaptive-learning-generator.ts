'use server';
/**
 * @fileOverview This file implements a Genkit flow for adaptive learning.
 * It determines the appropriate question difficulty and suggests reading levels
 * based on student performance and content complexity.
 *
 * - adaptiveLearningGenerator - The main function to call the adaptive learning flow.
 * - AdaptiveLearningGeneratorInput - The input type for the adaptiveLearningGenerator function.
 * - AdaptiveLearningGeneratorOutput - The return type for the adaptiveLearningGenerator function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdaptiveLearningGeneratorInputSchema = z.object({
  currentStudentLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe("The student's current adaptive learning level."),
  studentRecentPerformance: z.string().describe('A description or summary of the student\u0027s recent performance (e.g., "scored 80% on the last quiz", "struggled with complex vocabulary").'),
  contentReadingLevel: z.string().describe('The detected reading level of the content (e.g., "Grade 8", "Flesch Reading Ease 65").'),
  contentSummary: z.string().describe('A brief summary of the content to be adapted for.'),
});
export type AdaptiveLearningGeneratorInput = z.infer<typeof AdaptiveLearningGeneratorInputSchema>;

const AdaptiveLearningGeneratorOutputSchema = z.object({
  recommendedDifficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The recommended difficulty level for future questions based on analysis.'),
  readingLevelSuggestion: z.string().describe('A suggestion for the student\u0027s appropriate reading level for new content (e.g., "Target Grade 7-9 content").'),
  reasoning: z.string().describe('An explanation for the recommended difficulty and reading level suggestion.'),
});
export type AdaptiveLearningGeneratorOutput = z.infer<typeof AdaptiveLearningGeneratorOutputSchema>;

export async function adaptiveLearningGenerator(input: AdaptiveLearningGeneratorInput): Promise<AdaptiveLearningGeneratorOutput> {
  return adaptiveLearningGeneratorFlow(input);
}

const adaptiveLearningPrompt = ai.definePrompt({
  name: 'adaptiveLearningPrompt',
  input: { schema: AdaptiveLearningGeneratorInputSchema },
  output: { schema: AdaptiveLearningGeneratorOutputSchema },
  prompt: `You are an AI-powered adaptive learning engine designed to personalize a student's learning path.
Your goal is to recommend the optimal difficulty level for comprehension questions and suggest suitable reading content based on the student's current abilities and recent performance.

Here is the information about the student and the content:

Student's Current Adaptive Level: {{{currentStudentLevel}}}
Student's Recent Performance: {{{studentRecentPerformance}}}
Content Reading Level: {{{contentReadingLevel}}}
Content Summary: {{{contentSummary}}}

Analyze the provided information. If the student has been performing well, suggest increasing the difficulty. If the student has been struggling, suggest simplifying the questions. Also, provide a general suggestion for the student's appropriate reading level for new content.

Provide your recommendations for 'recommendedDifficulty' (either 'Beginner', 'Intermediate', or 'Advanced') and 'readingLevelSuggestion', along with a 'reasoning' for your decisions.
`,
});

const adaptiveLearningGeneratorFlow = ai.defineFlow(
  {
    name: 'adaptiveLearningGeneratorFlow',
    inputSchema: AdaptiveLearningGeneratorInputSchema,
    outputSchema: AdaptiveLearningGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await adaptiveLearningPrompt(input);
    return output!;
  }
);
