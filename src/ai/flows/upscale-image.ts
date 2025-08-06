'use server';

/**
 * @fileOverview A flow to upscale an image using a generative model.
 *
 * - upscaleImage - A function that handles the image upscaling process.
 * - UpscaleImageInput - The input type for the upscaleImage function.
 * - UpscaleImageOutput - The return type for the upscaleImage function.
 */

import { ai } from '@/ai/genkit';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';
import { UpscaleImageInputSchema, UpscaleImageOutputSchema } from '@/ai/schemas/upscale-image';

export type UpscaleImageInput = z.infer<typeof UpscaleImageInputSchema>;
export type UpscaleImageOutput = z.infer<typeof UpscaleImageOutputSchema>;

const upscaleImageFlow = ai.defineFlow(
  {
    name: 'upscaleImageFlow',
    inputSchema: UpscaleImageInputSchema,
    outputSchema: UpscaleImageOutputSchema,
  },
  async (input) => {
    const { apiKey, ...promptData } = input;

    const client = genkit({
      plugins: [googleAI({ apiKey })],
    });
    
    const prompt = client.definePrompt(
      {
        name: 'upscaleImagePrompt',
        input: { schema: UpscaleImageInputSchema.omit({apiKey: true}) },
        output: { schema: UpscaleImageOutputSchema },
        model: 'googleai/gemini-pro-vision',
        prompt: `Upscale this image to improve its resolution and detail, while maintaining the original subject and style. Do not change the content of the image.

Image: {{media url=photoDataUri}}`
      }
    )
    
    const { output } = await prompt(promptData);
    if (!output?.upscaledImageUri) {
      throw new Error('Image upscaling failed to produce a result.');
    }
    return output;
  }
);

export async function upscaleImage(input: UpscaleImageInput): Promise<UpscaleImageOutput> {
  return await upscaleImageFlow(input);
}
