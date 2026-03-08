'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating various types of comprehension questions
 * from an input text. It includes Multiple Choice Questions (MCQ), Short Answer Questions,
 * True/False Questions, and Fill-in-the-blanks questions.
 *
 * - generateQuestions - A function that handles the question generation process.
 * - QuestionGenerationInput - The input type for the generateQuestions function.
 * - QuestionGenerationOutput - The return type for the generateQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * @deprecated Please use QuestionGenerationInputSchema instead.
 */
const QuestionGenerationInputSchema = z.object({
  content: z
    .string()
    .describe('The text content from which to generate questions.'),
});
export type QuestionGenerationInput = z.infer<typeof QuestionGenerationInputSchema>;

const MultipleChoiceQuestionSchema = z.object({
  question: z.string().describe('The multiple-choice question text.'),
  options: z
    .array(z.string())
    .describe('An array of possible answer options for the MCQ.'),
  correctAnswer: z.string().describe('The correct answer among the options.'),
});

const ShortAnswerQuestionSchema = z.object({
  question: z.string().describe('The short answer question text.'),
  referenceAnswer: z
    .string()
    .describe('A concise reference answer for the short answer question.'),
});

const TrueFalseQuestionSchema = z.object({
  question: z.string().describe('The true/false question text.'),
  isTrue: z
    .boolean()
    .describe('Indicates whether the statement in the question is true or false.'),
});

const FillInTheBlanksQuestionSchema = z.object({
  sentenceWithBlank: z
    .string()
    .describe(
      "The sentence with a blank indicated by underscores (e.g., 'Photosynthesis is the process by which green plants make their food using ____.')"
    ),
  correctAnswer: z
    .string()
    .describe('The word or phrase that correctly fills the blank.'),
});

const QuestionGenerationOutputSchema = z.object({
  multipleChoiceQuestions: z
    .array(MultipleChoiceQuestionSchema)
    .describe('An array of generated multiple-choice questions.'),
  shortAnswerQuestions: z
    .array(ShortAnswerQuestionSchema)
    .describe('An array of generated short answer questions.'),
  trueFalseQuestions: z
    .array(TrueFalseQuestionSchema)
    .describe('An array of generated true/false questions.'),
  fillInTheBlanksQuestions: z
    .array(FillInTheBlanksQuestionSchema)
    .describe('An array of generated fill-in-the-blanks questions.'),
});
export type QuestionGenerationOutput = z.infer<typeof QuestionGenerationOutputSchema>;

export async function generateQuestions(
  input: QuestionGenerationInput
): Promise<QuestionGenerationOutput> {
  return questionGeneratorFlow(input);
}

const questionGenerationPrompt = ai.definePrompt({
  name: 'questionGenerationPrompt',
  input: {schema: QuestionGenerationInputSchema},
  output: {schema: QuestionGenerationOutputSchema},
  prompt: `You are an expert educational assistant tasked with generating a variety of comprehension questions from provided text content.

Generate questions of the following types:
- Multiple Choice Questions (MCQ)
- Short Answer Questions
- True/False Questions
- Fill-in-the-blanks Questions

Ensure the questions are contextually relevant to the provided content and cover key concepts.
For fill-in-the-blanks, use '____' to indicate the blank.

Content:
{{content}}
`,
});

const questionGeneratorFlow = ai.defineFlow(
  {
    name: 'questionGeneratorFlow',
    inputSchema: QuestionGenerationInputSchema,
    outputSchema: QuestionGenerationOutputSchema,
  },
  async input => {
    const {output} = await questionGenerationPrompt(input);
    return output!;
  }
);
