
'use server';

/**
 * @fileOverview A flow to generate a descriptive caption for an uploaded image.
 *
 * - generateImageCaption - A function that handles the image caption generation process.
 * - GenerateImageCaptionInput - The input type for the generateImageCaption function.
 * - GenerateImageCaptionOutput - The return type for the generateImageCaption function.
 */

import {ai} from '@/ai/genkit';
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
  const { apiKey, ...rest } = input;
  return generateImageCaptionFlow.withAuth({ apiKey })(rest);
}

const prompt = ai.definePrompt({
  name: 'generateImageCaptionPrompt',
  input: {schema: GenerateImageCaptionInputSchema.omit({apiKey: true})},
  output: {schema: GenerateImageCaptionOutputSchema},
  model: 'googleai/gemini-pro-vision',
  prompt: `You are an AI image captioning expert for stock photography. Generate a concise, factual, and descriptive caption for the image. The caption should be suitable for use as a description on a stock photo website.

Image: {{media url=photoDataUri}}`,
});

const generateImageCaptionFlow = ai.defineFlow(
  {
    name: 'generateImageCaptionFlow',
    inputSchema: GenerateImageCaptionInputSchema.omit({apiKey: true}),
    outputSchema: GenerateImageCaptionOutputSchema,
  },
  async (promptData) => {
    const {output} = await prompt(promptData);
    return output!;
  }
);
