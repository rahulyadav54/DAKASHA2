'use server';
/**
 * @fileOverview A Genkit flow for semantically evaluating student answers.
 * 
 * - semanticAnswerEvaluator - A function that evaluates a student's answer against a correct answer.
 * - SemanticAnswerEvaluatorInput - The input type for the semanticAnswerEvaluator function.
 * - SemanticAnswerEvaluatorOutput - The return type for the semanticAnswerEvaluator function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const SemanticAnswerEvaluatorInputSchema = z.object({
  question: z.string().describe('The short-answer question asked.'),
  correctAnswer: z.string().describe('The reference correct answer.'),
  studentAnswer: z.string().describe("The student's submitted answer."),
  context: z.string().optional().describe('The original text or passage from which the question was derived, if available.'),
});
export type SemanticAnswerEvaluatorInput = z.infer<typeof SemanticAnswerEvaluatorInputSchema>;

// Output Schema
const SemanticAnswerEvaluatorOutputSchema = z.object({
  correctnessScore: z.number().min(0).max(100).describe('A score from 0 to 100 indicating the semantic correctness of the student\'s answer compared to the correct answer.'),
  explanationFeedback: z.string().describe('Detailed feedback explaining the strengths and weaknesses of the student\'s answer.'),
  suggestionsForImprovement: z.string().describe('Specific suggestions for the student to improve their answer, focusing on accuracy, completeness, and clarity.'),
});
export type SemanticAnswerEvaluatorOutput = z.infer<typeof SemanticAnswerEvaluatorOutputSchema>;

// Wrapper function
export async function semanticAnswerEvaluator(input: SemanticAnswerEvaluatorInput): Promise<SemanticAnswerEvaluatorOutput> {
  return semanticAnswerEvaluatorFlow(input);
}

// Genkit Prompt definition
const semanticAnswerEvaluatorPrompt = ai.definePrompt({
  name: 'semanticAnswerEvaluatorPrompt',
  input: { schema: SemanticAnswerEvaluatorInputSchema },
  output: { schema: SemanticAnswerEvaluatorOutputSchema },
  prompt: `You are an expert educational tutor. Your task is to semantically evaluate a student's answer against a provided correct answer for a given question.
Provide a correctness score out of 100, detailed explanation feedback, and specific suggestions for improvement.

Question: {{{question}}}
Correct Answer: {{{correctAnswer}}}
Student Answer: {{{studentAnswer}}}

{{#if context}}
Context from which the question was derived:
{{{context}}}
{{/if}}

Based on the meaning and completeness, evaluate the student's answer.
The output MUST be a JSON object matching the SemanticAnswerEvaluatorOutputSchema.`,
});

// Genkit Flow definition
const semanticAnswerEvaluatorFlow = ai.defineFlow(
  {
    name: 'semanticAnswerEvaluatorFlow',
    inputSchema: SemanticAnswerEvaluatorInputSchema,
    outputSchema: SemanticAnswerEvaluatorOutputSchema,
  },
  async (input) => {
    const { output } = await semanticAnswerEvaluatorPrompt(input);
    if (!output) {
      throw new Error('Failed to get output from semantic answer evaluator prompt.');
    }
    return output;
  }
);
