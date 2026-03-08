'use server';
/**
 * @fileOverview Flow for generating a study guide from text, now including important questions and answers.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudyGuideInputSchema = z.object({
  content: z.string().describe('The content to summarize into a study guide.'),
});

const StudyGuideOutputSchema = z.object({
  title: z.string().describe('Title of the study guide.'),
  summary: z.string().describe('A high-level overview of the material.'),
  keyPoints: z.array(z.string()).describe('Main takeaways.'),
  vocabulary: z.array(z.object({
    word: z.string(),
    definition: z.string()
  })).describe('Key vocabulary terms.'),
  studyQuestions: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).describe('Important questions and their corresponding answers to test understanding.')
});

export type StudyGuideOutput = z.infer<typeof StudyGuideOutputSchema>;

export async function generateStudyGuide(input: z.infer<typeof StudyGuideInputSchema>): Promise<StudyGuideOutput> {
  const prompt = ai.definePrompt({
    name: 'studyGuidePrompt',
    input: { schema: StudyGuideInputSchema },
    output: { schema: StudyGuideOutputSchema },
    prompt: `Create a comprehensive study guide for the following text. 
    Include:
    1. A high-level summary.
    2. A list of bulleted key points (main takeaways).
    3. A glossary of important vocabulary terms.
    4. A list of at least 5 important "Important Questions" with their "Detailed Answers" that a student should know after reading this material.

    Text:
    {{{content}}}`,
  });

  const { output } = await prompt(input);
  if (!output) throw new Error("Failed to generate study guide.");
  return output;
}
