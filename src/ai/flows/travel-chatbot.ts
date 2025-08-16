// This file holds the Genkit flow for the travel chatbot, providing users with information about tour packages.

'use server';

/**
 * @fileOverview An AI-powered travel chatbot that provides information about tour packages.
 *
 * - travelChatbot - A function that handles user queries and returns relevant package information.
 * - TravelChatbotInput - The input type for the travelChatbot function.
 * - TravelChatbotOutput - The return type for the travelChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TravelChatbotInputSchema = z.object({
  query: z.string().describe('The user query about tour packages.'),
});
export type TravelChatbotInput = z.infer<typeof TravelChatbotInputSchema>;

const TravelChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user query.'),
});
export type TravelChatbotOutput = z.infer<typeof TravelChatbotOutputSchema>;

export async function travelChatbot(input: TravelChatbotInput): Promise<TravelChatbotOutput> {
  return travelChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'travelChatbotPrompt',
  input: {schema: TravelChatbotInputSchema},
  output: {schema: TravelChatbotOutputSchema},
  prompt: `You are a travel chatbot specializing in providing information about tour packages, including Umrah and Hajj packages.

  Respond to the following user query with helpful and informative answers to help them find the best package for their needs.

  Query: {{{query}}}`,
});

const travelChatbotFlow = ai.defineFlow(
  {
    name: 'travelChatbotFlow',
    inputSchema: TravelChatbotInputSchema,
    outputSchema: TravelChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
