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

// WordPress Related Actions

export interface WpSite {
    url: string;
    username: string;
    appPassword: string;
}

export interface WpMedia {
    id: number;
    source_url: string;
    alt_text: string;
    title: {
        rendered: string;
    };
}

function getAuthHeader(username: string, appPassword: string) {
    return 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64');
}

export async function connectWpSite(site: WpSite): Promise<{success: boolean, message: string}> {
    const { url, username, appPassword } = site;
    try {
        const response = await fetch(`${url}/wp-json/wp/v2/users/me`, {
            headers: {
                'Authorization': getAuthHeader(username, appPassword),
            },
        });

        const contentType = response.headers.get('content-type');

        if (response.ok && contentType && contentType.includes('application/json')) {
            return { success: true, message: 'Successfully connected to your WordPress site.' };
        }
        
        let errorMessage = `Connection failed with status ${response.status}.`;
        if (contentType && contentType.includes('application/json')) {
             try {
                const errorBody = await response.json();
                errorMessage = errorBody.message || 'An unknown error occurred.';
             } catch (e) {
                errorMessage = 'Received an invalid JSON error response from WordPress.';
             }
        } else {
            errorMessage = 'WordPress did not return a valid JSON response. This can be caused by an incorrect URL, a firewall, or a security plugin. Please also check your site\'s permalink settings.';
        }
        
        return { success: false, message: `Connection failed: ${errorMessage}` };

    } catch (error) {
        console.error('WP Connection Error:', error);
        if (error instanceof TypeError && error.message.includes('fetch failed')) {
            return { success: false, message: 'Network error. Check if the URL is correct and reachable, and ensure CORS is enabled for this domain.' };
        }
        return { success: false, message: 'An unknown error occurred. Check the console for more details.' };
    }
}


export async function fetchWpMedia(site: WpSite, page: number = 1, perPage: number = 20): Promise<{media: WpMedia[], error?: string}> {
    const { url, username, appPassword } = site;
    try {
        // Correctly construct the URL with query parameters
        const mediaUrl = new URL(`${url}/wp-json/wp/v2/media`);
        mediaUrl.searchParams.append('page', page.toString());
        mediaUrl.searchParams.append('per_page', perPage.toString());
        mediaUrl.searchParams.append('media_type', 'image');
        mediaUrl.searchParams.append('_fields', 'id,source_url,alt_text,title');

        const response = await fetch(mediaUrl.toString(), {
            headers: {
                'Authorization': getAuthHeader(username, appPassword),
            },
            cache: 'no-store', // Ensure we always get fresh data
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`WordPress did not return a valid JSON response. Check your site's permalink settings. Status: ${response.status}`);
        }

        const media: WpMedia[] = await response.json();

        // The json can contain an error object if the request is bad
        if (!response.ok) {
             const errorBody = media as any; // Cast to access potential error properties
             throw new Error(errorBody.message || 'Failed to fetch media.');
        }

        return { media };
    } catch (error) {
        console.error('WP Media Fetch Error:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred while fetching media.';
        return { media: [], error: message };
    }
}
