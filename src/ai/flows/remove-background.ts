
'use server';

/**
 * @fileOverview A flow for removing the background from an image using remove.bg.
 * - removeBackground - A function that handles the background removal process.
 * - RemoveBackgroundInput - The input type for the removeBackground function.
 * - RemoveBackgroundOutput - The return type for the removeBackground function.
 */

import { z } from 'zod';
import fetch from 'node-fetch';
import FormData from 'form-data';

const RemoveBackgroundInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to remove the background from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
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
  const endpointUrl = 'https://api.remove.bg/v1/removebg';
  const apiKey = process.env.REMOVE_BG_API_KEY;

  if (!apiKey) {
    throw new Error('Remove.bg API key is not configured.');
  }

  try {
    const imageBuffer = dataUriToBuffer(photoDataUri);

    const formData = new FormData();
    formData.append('image_file', imageBuffer, {
        filename: 'image.png'
    });
    formData.append('size', 'auto');
    
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json();
      const errorMessage = errorBody.errors?.[0]?.title || 'Unknown error from remove.bg';
      throw new Error(`External API Error: ${errorMessage}`);
    }

    const resultBuffer = await response.arrayBuffer();
    const processedPhotoDataUri = `data:image/png;base64,${Buffer.from(resultBuffer).toString('base64')}`;
    
    return { processedPhotoDataUri };

  } catch (error) {
    console.error('Error in removeBackground flow:', error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error('Failed to remove background via external service.');
  }
}
