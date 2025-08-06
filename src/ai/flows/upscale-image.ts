
'use server';

/**
 * @fileOverview A flow for upscaling an image using a free, public API.
 * This flow uses GFPGAN for face restoration and general upscaling.
 * - upscaleImage - A function that handles the image upscaling process.
 * - UpscaleImageInput - The input type for the upscaleImage function.
 * - UpscaleImageOutput - The return type for the upscaleImage function.
 */

import { z } from 'zod';

const UpscaleImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to upscale, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type UpscaleImageInput = z.infer<typeof UpscaleImageInputSchema>;

const UpscaleImageOutputSchema = z.object({
  upscaledPhotoDataUri: z
    .string()
    .describe('The upscaled photo as a data URI.'),
});
export type UpscaleImageOutput = z.infer<typeof UpscaleImageOutputSchema>;

export async function upscaleImage(input: UpscaleImageInput): Promise<UpscaleImageOutput> {
  const { photoDataUri } = input;
  const endpointUrl =
    'https://stanislavmichalov-image-face-upscale-restoration-gfpgan.hf.space/api/predict';

  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [photoDataUri],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`External API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const result = await response.json();

    if (result && result.data && result.data.length > 0 && result.data[0]) {
      return { upscaledPhotoDataUri: result.data[0] };
    } else {
      throw new Error('Invalid response structure from upscaling service.');
    }
  } catch (error) {
    console.error('Error in upscaleImage flow:', error);
    throw new Error('Failed to upscale image via external service.');
  }
}
