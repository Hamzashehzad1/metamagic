
'use server';

import { generateImageCaption } from '@/ai/flows/generate-image-caption';
import { extractSeoMetadata } from '@/ai/flows/extract-seo-metadata';
import { type MetadataSettings } from '@/components/metadata-settings';

export interface Metadata {
  caption: string;
  stockKeywords: string;
  stockTitle: string;
  stockDescription: string;
}

export interface ProcessedFile {
    name: string;
    metadata: Metadata;
}

async function processSingleFile(
  apiKey: string,
  fileDataUri: string,
  settings: MetadataSettings,
): Promise<Metadata> {
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
}


export async function processFiles(
  apiKey: string,
  files: {name: string, dataUri: string}[],
  settings: MetadataSettings,
): Promise<ProcessedFile[]> {
  try {
    const results: ProcessedFile[] = [];
    for (const file of files) {
        const metadata = await processSingleFile(apiKey, file.dataUri, settings);
        results.push({ name: file.name, metadata });
    }
    return results;
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

export async function processUrl(url: string): Promise<{name: string, dataUri: string} | {error: string}> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image. Status: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
        return { error: 'The provided URL does not point to a valid image file.' };
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const dataUri = `data:${contentType};base64,${buffer.toString('base64')}`;
    
    // Extract filename from URL
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1].split('?')[0] || 'pasted-image';

    return { name: filename, dataUri };
  } catch (error) {
    console.error('Error processing URL:', error);
    if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
            return { error: 'Could not fetch the image from the URL. Please check the link and CORS policy.'}
        }
        return { error: error.message };
    }
    return { error: 'An unknown error occurred while fetching the image.' };
  }
}
