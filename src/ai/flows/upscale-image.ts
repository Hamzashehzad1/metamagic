
'use server';

/**
 * @fileOverview A flow for upscaling an image using image-upscaling.net
 * - upscaleImage - A function that handles the image upscaling process.
 * - UpscaleImageInput - The input type for the upscaleImage function.
 * - UpscaleImageOutput - The return type for the upscaleImage function.
 */

import { z } from 'zod';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import FormData from 'form-data';

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

function dataUriToBuffer(dataUri: string) {
    const base64 = dataUri.split(',')[1];
    return Buffer.from(base64, 'base64');
}

export async function upscaleImage(input: UpscaleImageInput): Promise<UpscaleImageOutput> {
  const { photoDataUri } = input;
  const endpointUrl = 'https://api.image-upscaling.net/v1/upscale';
  const apiKey = process.env.UPSCALE_API_KEY;

  if (!apiKey) {
    throw new Error('Upscaler API key is not configured.');
  }

  try {
    const imageBuffer = dataUriToBuffer(photoDataUri);
    const mimeType = photoDataUri.substring(photoDataUri.indexOf(':') + 1, photoDataUri.indexOf(';'));

    const formData = new FormData();
    formData.append('image', imageBuffer, {
        contentType: mimeType,
        filename: 'image.png'
    });

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: { 
        ...formData.getHeaders(),
        'X-Api-Key': apiKey,
      },
      body: formData,
      agent: new HttpsProxyAgent('https://proxy.dev.internal:3128')
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`External API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }
    
    const resultBuffer = await response.buffer();
    const upscaledPhotoDataUri = `data:${mimeType};base64,${resultBuffer.toString('base64')}`;

    return { upscaledPhotoDataUri };
  } catch (error) {
    console.error('Error in upscaleImage flow:', error);
    throw new Error('Failed to upscale image via external service.');
  }
}
