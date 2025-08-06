
'use server';

import { generateImageCaption } from '@/ai/flows/generate-image-caption';
import { extractSeoMetadata } from '@/ai/flows/extract-seo-metadata';
import { upscaleImage } from '@/ai/flows/upscale-image';
import { type MetadataSettings } from '@/components/metadata-settings';

export interface Metadata {
  caption: string;
  stockKeywords: string;
  stockTitle: string;
  stockDescription: string;
}

export async function processFile(
  apiKey: string,
  fileDataUri: string,
  settings: MetadataSettings,
): Promise<Metadata> {
  try {
    const { caption } = await generateImageCaption({ apiKey, photoDataUri: fileDataUri });

    const { stockKeywords, stockTitle, stockDescription } = await extractSeoMetadata({
      apiKey,
      photoDataUri: fileDataUri,
      imageCaption: caption,
      ...settings,
    });

    return {
      caption,
      stockKeywords,
      stockTitle,
      stockDescription,
    };
  } catch (error) {
    console.error('Error processing file:', error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error('Invalid Gemini API Key. Please check your key and try again.');
        }
        // Re-throw the original error to get more specific feedback in the UI
        throw new Error(error.message);
    }
    throw new Error('An unknown error occurred while generating metadata.');
  }
}

export async function upscaleImageAction(fileDataUri: string): Promise<{ upscaledPhotoDataUri: string }> {
    try {
        const result = await upscaleImage({ photoDataUri: fileDataUri });
        return result;
    } catch (error) {
        console.error('Error upscaling file:', error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unknown error occurred while upscaling the image.');
    }
}
