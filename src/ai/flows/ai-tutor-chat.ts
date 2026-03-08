'use server';
/**
 * @fileOverview AI Tutor chat flow.
 *
 * This flow provides conversational assistance to students, optionally using
 * a specific reading session as context.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TutorMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
});

const TutorChatInputSchema = z.object({
  history: z.array(TutorMessageSchema).describe('The conversation history.'),
  message: z.string().describe('The current user message.'),
  context: z.string().optional().describe('Optional reading material context.'),
});
export type TutorChatInput = z.infer<typeof TutorChatInputSchema>;

const TutorChatOutputSchema = z.object({
  response: z.string().describe('The AI tutor\'s response.'),
});
export type TutorChatOutput = z.infer<typeof TutorChatOutputSchema>;

export async function tutorChat(input: TutorChatInput): Promise<TutorChatOutput> {
  return tutorChatFlow(input);
}

const tutorPrompt = ai.definePrompt({
  name: 'tutorPrompt',
  input: { schema: TutorChatInputSchema },
  output: { schema: TutorChatOutputSchema },
  prompt: `You are a friendly and encouraging AI Tutor for SmartRead AI.
Your goal is to help students understand reading material, explain complex concepts simply, and provide guidance on comprehension.

{{#if context}}
The student is currently studying this material:
{{{context}}}
{{/if}}

{{#if history}}
Conversation History:
{{#each history}}
- {{role}}: {{{text}}}
{{/each}}
{{/if}}

Guidelines:
- If the student asks about the provided context, answer accurately based on that text.
- If they ask general questions, provide helpful educational guidance.
- Keep explanations clear and age-appropriate (generally for middle/high school students).
- Be encouraging and patient.
- Do not provide answers to quiz questions directly if you think they are cheating, but explain the *logic* to help them find the answer.

Current Message: {{{message}}}

Response in a helpful, conversational tone.`,
});

const tutorChatFlow = ai.defineFlow(
  {
    name: 'tutorChatFlow',
    inputSchema: TutorChatInputSchema,
    outputSchema: TutorChatOutputSchema,
  },
  async (input) => {
    const { output } = await tutorPrompt(input);
    if (!output) throw new Error("Tutor failed to respond.");
    return output;
  }
);