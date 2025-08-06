
'use server';

import { generateImageCaption } from '@/ai/flows/generate-image-caption';
import { extractSeoMetadata } from '@/ai/flows/extract-seo-metadata';
import { upscaleImage as upscaleImageFlow } from '@/ai/flows/upscale-image';
import { type MetadataSettings } from '@/components/metadata-settings';

export interface Metadata {
  caption: string;
  seoKeywords: string;
  seoTitle: string;
  seoDescription: string;
}

export async function processFile(
  apiKey: string,
  fileDataUri: string,
  settings: MetadataSettings,
): Promise<Metadata> {
  try {
    const { caption } = await generateImageCaption({ apiKey, photoDataUri: fileDataUri });

    const { seoKeywords, seoTitle, seoDescription } = await extractSeoMetadata({
      apiKey,
      photoDataUri: fileDataUri,
      imageCaption: caption,
      ...settings,
    });

    return {
      caption,
      seoKeywords,
      seoTitle,
      seoDescription,
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

export async function upscaleImage(apiKey: string, fileDataUri: string): Promise<string> {
    try {
        const { upscaledImageUri } = await upscaleImageFlow({ apiKey, photoDataUri: fileDataUri });
        return upscaledImageUri;
    } catch (error) {
        console.error('Error upscaling file:', error);
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                throw new Error('Invalid Gemini API Key. Please check your key and try again.');
            }
             // Re-throw the original error to get more specific feedback in the UI
            throw new Error(error.message);
        }
        throw new Error('An unknown error occurred while upscaling the image.');
    }
}
