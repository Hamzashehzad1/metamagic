'use server';

import { generateImageCaption } from '@/ai/flows/generate-image-caption';
import { extractSeoMetadata } from '@/ai/flows/extract-seo-metadata';

export interface Metadata {
  caption: string;
  seoKeywords: string;
  seoTitle: string;
  seoDescription: string;
}

export async function processImage(
  photoDataUri: string
): Promise<Metadata> {
  try {
    const { caption } = await generateImageCaption({ photoDataUri });

    const { seoKeywords, seoTitle, seoDescription } = await extractSeoMetadata({
      photoDataUri,
      imageCaption: caption,
    });

    return {
      caption,
      seoKeywords,
      seoTitle,
      seoDescription,
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to generate metadata from AI. Please try again.');
  }
}
