'use server';

import { generateImageCaption } from '@/ai/flows/generate-image-caption';
import { extractSeoMetadata } from '@/ai/flows/extract-seo-metadata';
import { upscaleImage } from '@/ai/flows/upscale-image';

export interface Metadata {
  caption: string;
  seoKeywords: string;
  seoTitle: string;
  seoDescription: string;
}

export async function processFile(
  fileDataUri: string
): Promise<Metadata> {
  try {
    const { caption } = await generateImageCaption({ photoDataUri: fileDataUri });

    const { seoKeywords, seoTitle, seoDescription } = await extractSeoMetadata({
      photoDataUri: fileDataUri,
      imageCaption: caption,
    });

    return {
      caption,
      seoKeywords,
      seoTitle,
      seoDescription,
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error('Failed to generate metadata from AI. Please try again.');
  }
}


export async function upscaleFile(
  fileDataUri: string,
  magnification: number
): Promise<string> {
  try {
    const { upscaledPhotoDataUri } = await upscaleImage({
      photoDataUri: fileDataUri,
      magnification: magnification
    });

    return upscaledPhotoDataUri;
  } catch (error) {
    console.error('Error upscaling file:', error);
    throw new Error('Failed to upscale image with AI. Please try again.');
  }
}
