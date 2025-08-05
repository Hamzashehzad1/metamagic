'use server';

/**
 * @fileOverview A flow to upscale an image using a generative model.
 *
 * - upscaleImage - A function that handles the image upscaling process.
 * - UpscaleImageInput - The input type for the upscaleImage function.
 * - UpscaleImageOutput - The return type for the upscaleImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { UpscaleImageInputSchema, UpscaleImageOutputSchema } from '@/ai/schemas/upscale-image';

export type UpscaleImageInput = z.infer<typeof UpscaleImageInputSchema>;
export type UpscaleImageOutput = z.infer<typeof UpscaleImageOutputSchema>;

export const upscaleImage = ai.defineFlow(
  {
    name: 'upscaleImage',
    inputSchema: UpscaleImageInputSchema,
    outputSchema: UpscaleImageOutputSchema,
  },
  async (input) => {
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-pro-vision',
      prompt: [
        { text: "Upscale this image to improve its resolution and detail, while maintaining the original subject and style. Do not change the content of the image." },
        { media: { url: input.photoDataUri } },
      ],
      config: {
        // High temperature can sometimes help with creative generation for upscaling
        temperature: 0.8,
      },
       output: {
        format: 'image',
      },
    });

    const upscaledImage = media.url;
    if (!upscaledImage) {
        throw new Error('Image upscaling failed to produce a result.');
    }

    return { upscaledImageUri: upscaledImage };
  }
);