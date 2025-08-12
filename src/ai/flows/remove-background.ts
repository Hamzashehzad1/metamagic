
'use server';

/**
 * @fileOverview A flow for removing the background from an image.
 * - removeBackground - A function that handles the background removal process.
 * - RemoveBackgroundInput - The input type for the removeBackground function.
 * - RemoveBackgroundOutput - The return type for the removeBackground function.
 */

import { z } from 'zod';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import FormData from 'form-data';

const RemoveBackgroundInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to remove the background from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RemoveBackgroundInput = z.infer<typeof RemoveBackgroundInputSchema>;

const RemoveBackgroundOutputSchema = z.object({
  processedPhotoDataUri: z
    .string()
    .describe('The processed photo as a data URI.'),
});
export type RemoveBackgroundOutput = z.infer<typeof RemoveBackgroundOutputSchema>;

function dataUriToBuffer(dataUri: string) {
    const base64 = dataUri.split(',')[1];
    return Buffer.from(base64, 'base64');
}

export async function removeBackground(input: RemoveBackgroundInput): Promise<RemoveBackgroundOutput> {
  const { photoDataUri } = input;
  const endpointUrl = 'https://bg.remove.pics/api/v1/remove';

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
      headers: formData.getHeaders(),
      body: formData,
      agent: new HttpsProxyAgent('https://proxy.dev.internal:3128')
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`External API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const resultBuffer = await response.buffer();
    const processedPhotoDataUri = `data:image/png;base64,${resultBuffer.toString('base64')}`;
    
    return { processedPhotoDataUri };

  } catch (error) {
    console.error('Error in removeBackground flow:', error);
    throw new Error('Failed to remove background via external service.');
  }
}
