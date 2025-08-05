'use server';

import { generateImageCaption } from '@/ai/flows/generate-image-caption';
import { extractSeoMetadata } from '@/ai/flows/extract-seo-metadata';
import { configureGenkit } from '@/ai/genkit';
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
    configureGenkit(apiKey);
    const { caption } = await generateImageCaption({ photoDataUri: fileDataUri });

    const { seoKeywords, seoTitle, seoDescription } = await extractSeoMetadata({
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
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error('Invalid Gemini API Key. Please check your key and try again.');
    }
    throw new Error('Failed to generate metadata from AI. Please try again.');
  }
}

export async function upscaleImage(apiKey: string, fileDataUri: string): Promise<string> {
    try {
        configureGenkit(apiKey);
        const upscaler = (await import('@/ai/flows/upscale-image')).upscaleImage;
        const { upscaledImageUri } = await upscaler({ photoDataUri: fileDataUri });
        return upscaledImageUri;
    } catch (error) {
        console.error('Error upscaling file:', error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error('Invalid Gemini API Key. Please check your key and try again.');
        }
        throw new Error('Failed to upscale image with AI. Please try again.');
    }
}
