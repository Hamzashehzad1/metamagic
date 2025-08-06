
'use server';

/**
 * @fileOverview A flow for upscaling an image using the GFPGAN model via a Hugging Face Space API.
 *
 * - upscaleImage - A function that handles the image upscaling process.
 * - UpscaleImageInput - The input type for the upscaleImage function.
 * - UpscaleImageOutput - The return type for the upscaleImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
    .describe(
      "The upscaled photo, as a data URI that must include a MIME type and use Base64 encoding."
    ),
});
export type UpscaleImageOutput = z.infer<typeof UpscaleImageOutputSchema>;


export async function upscaleImage(input: UpscaleImageInput): Promise<UpscaleImageOutput> {
  return upscaleImageFlow(input);
}

const upscaleImageFlow = ai.defineFlow(
  {
    name: 'upscaleImageFlow',
    inputSchema: UpscaleImageInputSchema,
    outputSchema: UpscaleImageOutputSchema,
  },
  async (input) => {
    const { photoDataUri } = input;
    
    const GFPGAN_API_URL = "https://stanislavmichalov-image-face-upscale-restoration-gfpgan.hf.space/api/predict";

    try {
        const response = await fetch(GFPGAN_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              // The API expects the data in an array.
              data: [photoDataUri]
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('GFPGAN API Error:', errorBody);
            throw new Error(`GFPGAN API request failed with status ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
          throw new Error('Invalid response format from GFPGAN API');
        }

        const upscaledPhotoDataUri = result.data[0];

        return { upscaledPhotoDataUri };

    } catch(error) {
        console.error("Error calling GFPGAN API:", error);
        throw new Error("Failed to upscale image via external service.");
    }
  }
);
