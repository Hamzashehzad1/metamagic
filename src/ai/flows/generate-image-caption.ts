'use server';

/**
 * @fileOverview A flow to generate a descriptive caption for an uploaded image.
 *
 * - generateImageCaption - A function that handles the image caption generation process.
 * - GenerateImageCaptionInput - The input type for the generateImageCaption function.
 * - GenerateImageCaptionOutput - The return type for the generateImageCaption function.
 */

import {ai} from '@/ai/genkit';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const GenerateImageCaptionInputSchema = z.object({
  apiKey: z.string().describe('The user\'s Gemini API key.'),
  photoDataUri: z
    .string()
    .describe(
      "A photo to generate a caption for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateImageCaptionInput = z.infer<typeof GenerateImageCaptionInputSchema>;

const GenerateImageCaptionOutputSchema = z.object({
  caption: z.string().describe('A descriptive caption for the image.'),
});
export type GenerateImageCaptionOutput = z.infer<typeof GenerateImageCaptionOutputSchema>;

export async function generateImageCaption(input: GenerateImageCaptionInput): Promise<GenerateImageCaptionOutput> {
  return generateImageCaptionFlow(input);
}


const generateImageCaptionFlow = ai.defineFlow(
  {
    name: 'generateImageCaptionFlow',
    inputSchema: GenerateImageCaptionInputSchema,
    outputSchema: GenerateImageCaptionOutputSchema,
  },
  async (input) => {
    const { apiKey, ...promptData } = input;

    const client = genkit({
      plugins: [googleAI({ apiKey })],
    });

    const prompt = client.definePrompt({
      name: 'generateImageCaptionPrompt',
      input: {schema: GenerateImageCaptionInputSchema.omit({apiKey: true})},
      output: {schema: GenerateImageCaptionOutputSchema},
      model: 'googleai/gemini-pro-vision',
      prompt: `You are an AI image captioning expert. Generate a concise and descriptive caption for the image.

Image: {{media url=photoDataUri}}`,
    });

    const {output} = await prompt(promptData);
    return output!;
  }
);
