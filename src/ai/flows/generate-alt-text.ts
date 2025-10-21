
'use server';

/**
 * @fileOverview A flow to generate a descriptive alt text for an image URL.
 *
 * - generateAltText - A function that handles the image alt text generation process.
 * - GenerateAltTextInput - The input type for the generateAltText function.
 * - GenerateAltTextOutput - The return type for the generateAltText function.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateAltTextInputSchema = z.object({
  apiKey: z.string().describe('The user\'s Gemini API key.'),
  imageUrl: z
    .string()
    .describe('A URL of an image to generate alt text for.'),
});
export type GenerateAltTextInput = z.infer<typeof GenerateAltTextInputSchema>;

const GenerateAltTextOutputSchema = z.object({
  altText: z.string().describe('Descriptive alt text for the image.'),
});
export type GenerateAltTextOutput = z.infer<typeof GenerateAltTextOutputSchema>;

export async function generateAltText(input: GenerateAltTextInput): Promise<GenerateAltTextOutput> {
  const { apiKey, ...rest } = input;

  const ai = genkit({
    plugins: [googleAI({ apiKey })],
  });

  const prompt = ai.definePrompt({
    name: 'generateAltTextPrompt',
    input: {schema: GenerateAltTextInputSchema.omit({apiKey: true})},
    output: {schema: GenerateAltTextOutputSchema},
    model: 'gemini-pro-vision',
    prompt: `You are an AI expert in SEO and accessibility. Generate a concise, descriptive, and SEO-friendly alt text for the following image. The alt text should accurately describe the image for visually impaired users and search engines. Do not include phrases like "image of" or "picture of".

Image: {{media url=imageUrl}}`,
  });

  const generateAltTextFlow = ai.defineFlow(
    {
      name: 'generateAltTextFlow',
      inputSchema: GenerateAltTextInputSchema.omit({apiKey: true}),
      outputSchema: GenerateAltTextOutputSchema,
    },
    async (promptData) => {
      const {output} = await prompt(promptData);
      return output!;
    }
  );

  return generateAltTextFlow(rest);
}
