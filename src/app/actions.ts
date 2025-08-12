
'use server';

import { generateImageCaption } from '@/ai/flows/generate-image-caption';
import { extractSeoMetadata } from '@/ai/flows/extract-seo-metadata';
import { type MetadataSettings } from '@/components/metadata-settings';
import { upscaleImage } from '@/ai/flows/upscale-image';
import { removeBackground } from '@/ai/flows/remove-background';
import { textToSpeech } from '@/ai/flows/text-to-speech';

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

export async function upscaleImageAction(photoDataUri: string) {
  try {
    const result = await upscaleImage({ photoDataUri });
    return result;
  } catch (error) {
    console.error('Error in upscaleImageAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during upscaling.';
    throw new Error(errorMessage);
  }
}

export async function removeBackgroundAction(photoDataUri: string) {
  try {
    const result = await removeBackground({ photoDataUri });
    return result;
  } catch (error) {
    console.error('Error in removeBackgroundAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during background removal.';
    throw new Error(errorMessage);
  }
}

export async function textToSpeechAction(text: string) {
  try {
    const result = await textToSpeech({ text });
    return result;
  } catch (error) {
    console.error('Error in textToSpeechAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during text-to-speech conversion.';
    throw new Error(errorMessage);
  }
}
