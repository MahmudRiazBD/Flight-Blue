'use server';

/**
 * @fileOverview Provides cultural advice and travel tips for a given destination.
 *
 * - getCulturalAdvice - A function that provides cultural advice based on the destination.
 * - CulturalAdviceInput - The input type for the getCulturalAdvice function.
 * - CulturalAdviceOutput - The return type for the getCulturalAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CulturalAdviceInputSchema = z.object({
  destination: z.string().describe('The destination for which cultural advice is needed.'),
  query: z.string().describe('The specific question about the destination culture.'),
});
export type CulturalAdviceInput = z.infer<typeof CulturalAdviceInputSchema>;

const CulturalAdviceOutputSchema = z.object({
  advice: z.string().describe('Cultural advice and travel tips for the specified destination.'),
});
export type CulturalAdviceOutput = z.infer<typeof CulturalAdviceOutputSchema>;

export async function getCulturalAdvice(input: CulturalAdviceInput): Promise<CulturalAdviceOutput> {
  return culturalAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'culturalAdvicePrompt',
  input: {schema: CulturalAdviceInputSchema},
  output: {schema: CulturalAdviceOutputSchema},
  prompt: `You are a travel expert specializing in cultural sensitivity. A user is planning a trip to {{destination}} and has the following question: {{query}}

  Provide detailed cultural advice and travel tips to help the user be better prepared and respectful of local customs. Focus on the specific question asked, but also provide general advice. The answer should be detailed and comprehensive.
  Format your answer in markdown.
  `,
});

const culturalAdviceFlow = ai.defineFlow(
  {
    name: 'culturalAdviceFlow',
    inputSchema: CulturalAdviceInputSchema,
    outputSchema: CulturalAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
