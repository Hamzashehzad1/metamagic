
'use server';

/**
 * @fileOverview A flow for upscaling an image using the Gradio client to connect to a Hugging Face Space.
 *
 * - upscaleImage - A function that handles the image upscaling process.
 * - UpscaleImageInput - The input type for the upscaleImage function.
 * - UpscaleImageOutput - The return type for the upscaleImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { client } from "@gradio/client";

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

// Helper function to convert data URI to Blob
async function dataUriToBlob(dataUri: string): Promise<Blob> {
    const response = await fetch(dataUri);
    const blob = await response.blob();
    return blob;
}

const upscaleImageFlow = ai.defineFlow(
  {
    name: 'upscaleImageFlow',
    inputSchema: UpscaleImageInputSchema,
    outputSchema: UpscaleImageOutputSchema,
  },
  async (input) => {
    const { photoDataUri } = input;
    
    const GRADIO_API_URL = "https://bookbot-image-upscaling-playground.hf.space/";

    try {
        const imageBlob = await dataUriToBlob(photoDataUri);

        const app = await client(GRADIO_API_URL);
        const result = await app.predict("/predict", [
            imageBlob, 	// blob in 'Input Image' Image component		
            "modelx2",  // string in 'Choose Upscaler' Radio component
        ]);

        if (!result || typeof result !== 'object' || !('data' in result) || !Array.isArray(result.data) || result.data.length === 0) {
          throw new Error('Invalid response format from Gradio API');
        }
        
        // The result from this specific Gradio app is a URL to the processed file.
        // We need to fetch it and convert it back to a data URI to send to the client.
        const upscaledImageUrl = result.data[0];

        if (typeof upscaledImageUrl !== 'string' || !upscaledImageUrl.startsWith('http')) {
             throw new Error('Gradio API did not return a valid image URL.');
        }

        const imageResponse = await fetch(upscaledImageUrl);
        const imageBlobResult = await imageResponse.blob();
        
        const upscaledPhotoDataUri = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(imageBlobResult);
        });

        return { upscaledPhotoDataUri };

    } catch(error) {
        console.error("Error calling Gradio client:", error);
        throw new Error("Failed to upscale image via external service.");
    }
  }
);
