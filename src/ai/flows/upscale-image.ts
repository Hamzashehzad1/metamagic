'use server';

/**
 * @fileOverview A flow to upscale an image using an AI model.
 *
 * - upscaleImage - A function that handles the image upscaling process.
 */

import {ai} from '@/ai/genkit';
import {
  UpscaleImageInputSchema,
  UpscaleImageOutputSchema,
  type UpscaleImageInput,
  type UpscaleImageOutput,
} from '@/ai/schemas/upscale-image';

export async function upscaleImage(input: UpscaleImageInput): Promise<UpscaleImageOutput> {
  return upscaleImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'upscaleImagePrompt',
  input: {schema: UpscaleImageInputSchema},
  output: {schema: UpscaleImageOutputSchema},
  prompt: `Upscale the following image by a factor of {{{magnification}}}.

Image: {{media url=photoDataUri}}`,
  config: {
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    responseModalities: ['IMAGE'],
  },
});

const upscaleImageFlow = ai.defineFlow(
  {
    name: 'upscaleImageFlow',
    inputSchema: UpscaleImageInputSchema,
    outputSchema: UpscaleImageOutputSchema,
  },
  async (input) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {text: `Upscale this image to ${input.magnification}x its original size.`},
        {media: {url: input.photoDataUri}}
      ],
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    const imagePart = media.url;
    if (!imagePart) {
        throw new Error('Image generation failed to produce an output.');
    }
    
    return {
      upscaledPhotoDataUri: imagePart
    };
  }
);
