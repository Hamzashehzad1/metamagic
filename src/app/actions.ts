
'use server';

import { generateImageCaption } from '@/ai/flows/generate-image-caption';
import { extractSeoMetadata } from '@/ai/flows/extract-seo-metadata';
import { generateAltText } from '@/ai/flows/generate-alt-text';
import { generateMetaDescription } from '@/ai/flows/generate-meta-description';
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

function handleGenerativeAiError(error: unknown): Error {
    if (error instanceof Error) {
        const lowerCaseMessage = error.message.toLowerCase();
        if (lowerCaseMessage.includes('429') || lowerCaseMessage.includes('quota')) {
            const quotaError = new Error('Your Gemini Quota has been exceeded, please update your api.');
            // Add a specific property to identify this error type
            (quotaError as any).code = 'GEMINI_QUOTA_EXCEEDED';
            return quotaError;
        }
        if (lowerCaseMessage.includes('api key not valid')) {
            return new Error('Invalid Gemini API Key. Please check your key and try again.');
        }
        return error;
    }
    return new Error('An unknown error occurred while generating metadata.');
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
): Promise<{results: ProcessedFile[], apiCalls: number} | {error: string}> {
  try {
    const results: ProcessedFile[] = [];
    // Each file processing involves 2 API calls: one for caption, one for metadata
    const apiCallsPerFile = 2;
    for (const file of files) {
        const metadata = await processSingleFile(apiKey, file.dataUri, settings);
        results.push({ name: file.name, metadata });
    }
    return { results, apiCalls: files.length * apiCallsPerFile };
  } catch (error) {
    console.error('Error processing file:', error);
    const handledError = handleGenerativeAiError(error);
    return { error: handledError.message, ...('code' in handledError && { code: (handledError as any).code }) };
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
    
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1].split('?')[0] || 'pasted-image';

    return { name: filename, dataUri };
  } catch (error) {
    console.error('Error processing URL:', error);
    if (error instanceof Error) {
        if (error.message.includes('fetch failed')) {
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
            cache: 'no-store',
        });

        const contentType = response.headers.get('content-type');
        if (response.ok && contentType && contentType.includes('application/json')) {
            return { success: true, message: 'Successfully connected to your WordPress site.' };
        }
        
        let errorMessage;
        if (contentType && contentType.includes('application/json')) {
            const errorBody = await response.json();
            errorMessage = errorBody.message || `API error with status ${response.status}.`;
        } else {
             errorMessage = 'WordPress did not return a valid JSON response. This can be caused by an incorrect URL, a firewall, or a security plugin. Please also check your site\'s permalink settings.';
        }
        
        return { success: false, message: `Connection failed: ${errorMessage}` };

    } catch (error) {
        console.error('WP Connection Fetch Error:', error);
        if (error instanceof TypeError && error.message.includes('fetch failed')) {
            return { success: false, message: 'Network error. Check if the URL is correct and reachable, and ensure your server has CORS enabled for this domain.' };
        }
        return { success: false, message: 'An unknown error occurred during connection. Check the browser console for more details.' };
    }
}


export async function fetchWpMedia(site: WpSite, page: number = 1, perPage: number = 20): Promise<{media: WpMedia[], totalMedia?: number, error?: string}> {
    const { url, username, appPassword } = site;
    try {
        const mediaUrl = new URL(`${url}/wp-json/wp/v2/media`);
        mediaUrl.searchParams.append('page', page.toString());
        mediaUrl.searchParams.append('per_page', perPage.toString());
        mediaUrl.searchParams.append('media_type', 'image');
        mediaUrl.searchParams.append('_fields', 'id,source_url,alt_text,title');

        const response = await fetch(mediaUrl.toString(), {
            headers: {
                'Authorization': getAuthHeader(username, appPassword),
            },
            cache: 'no-store',
        });

        const contentType = response.headers.get('content-type');
        if (!response.ok) {
            let errorBody;
            try {
                if (contentType && contentType.includes('application/json')) {
                    errorBody = await response.json();
                } else {
                    throw new Error(`Failed to fetch media. WordPress returned a non-JSON response with status ${response.status}. Please check your site's permalink settings.`);
                }
            } catch (e) {
                 throw new Error(`Failed to fetch media. WordPress returned a non-JSON response with status ${response.status}. Please check your site's permalink settings.`);
            }
            throw new Error(errorBody.message || 'Failed to fetch media.');
        }
        
        const media: WpMedia[] = await response.json();
        const totalMedia = response.headers.get('X-WP-Total');

        return { media, totalMedia: totalMedia ? parseInt(totalMedia, 10) : undefined };

    } catch (error) {
        console.error('WP Media Fetch Error:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred while fetching media.';
        return { media: [], error: message };
    }
}

export async function updateWpMediaItem(site: WpSite, mediaId: number, altText: string): Promise<{success: boolean, error?: string}> {
    const { url, username, appPassword } = site;
    try {
        const response = await fetch(`${url}/wp-json/wp/v2/media/${mediaId}`, {
            method: 'POST',
            headers: {
                'Authorization': getAuthHeader(username, appPassword),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                alt_text: altText,
            }),
            cache: 'no-store',
        });

        if (!response.ok) {
             const errorBody = await response.json();
            throw new Error(errorBody.message || `Failed to update media item ${mediaId}.`);
        }

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred while updating media.';
        return { success: false, error: message };
    }
}


export async function generateAndSaveAltText(
    apiKey: string, 
    site: WpSite, 
    mediaItem: WpMedia
): Promise<{id: number, newAltText: string, apiCalls: number} | {id: number, error: string, code?: string}> {
    try {
        if (!apiKey) {
            throw new Error('Gemini API key is not provided.');
        }
        const { altText } = await generateAltText({ apiKey, imageUrl: mediaItem.source_url });
        
        const updateResult = await updateWpMediaItem(site, mediaItem.id, altText);

        if (!updateResult.success) {
            throw new Error(updateResult.error);
        }

        return { id: mediaItem.id, newAltText: altText, apiCalls: 1 };

    } catch(error) {
        const handledError = handleGenerativeAiError(error);
        return { id: mediaItem.id, error: handledError.message, ...('code' in handledError && { code: (handledError as any).code }) };
    }
}

// Meta Description Actions

export async function fetchPageContent(url: string): Promise<{content: string} | {error: string}> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch page content. Status: ${response.status}`);
        }
        // Very basic text extraction. Might need a more robust solution like a headless browser for complex sites.
        const text = await response.text();
        return { content: text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}

export async function generateMetaDescriptionAction(
    apiKey: string, 
    pageContent: string
): Promise<{metaDescription: string, apiCalls: number} | {error: string, code?: string}> {
    try {
        if (!apiKey) {
            throw new Error('Gemini API key is not provided.');
        }
        const { metaDescription } = await generateMetaDescription({ apiKey, pageContent });
        return { metaDescription, apiCalls: 1 };
    } catch(error) {
        const handledError = handleGenerativeAiError(error);
        return { error: handledError.message, ...('code' in handledError && { code: (handledError as any).code }) };
    }
}
