'use server';

import { generateImageCaption } from '@/ai/flows/generate-image-caption';
import { extractSeoMetadata } from '@/ai/flows/extract-seo-metadata';
import { generateAltText } from '@/ai/flows/generate-alt-text';
import { generateMetaDescription } from '@/ai/flows/generate-meta-description';
import { summarizeContentForMeta } from '@/ai/flows/summarize-content-for-meta';
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
            const quotaError = new Error(`Your Gemini Quota has been exceeded. Full error: ${error.message}`);
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
): Promise<{results: ProcessedFile[], apiCalls: number} | {error: string, code?: string}> {
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

export interface WpPost {
    id: number;
    title: {
        rendered: string;
    };
    link: string;
    type: 'post' | 'page';
    meta: {
        _aioseo_description?: string;
        [key: string]: any;
    }
}

function getAuthHeader(username: string, appPassword: string) {
    return 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64');
}

export async function connectWpSite(site: WpSite): Promise<{success: boolean, message: string}> {
    const { url, username, appPassword } = site;
    const cleanedUrl = url.endsWith('/') ? url.slice(0, -1) : url;

    const tryConnection = async (testUrl: string): Promise<Response> => {
        return fetch(testUrl, {
            headers: { 'Authorization': getAuthHeader(username, appPassword) },
            cache: 'no-store',
        });
    };
    
    // --- Attempt 1: Standard "Pretty Permalinks" URL ---
    try {
        const prettyUrl = `${cleanedUrl}/wp-json/wp/v2/users/me`;
        const response = await tryConnection(prettyUrl);

        if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
            return { success: true, message: 'Successfully connected to your WordPress site.' };
        }
        // If it's a clear auth error, fail fast.
        if (response.status === 401 || response.status === 403) {
            return { success: false, message: 'Authentication failed. Please check your username and application password.' };
        }
    } catch (error) {
        // Fall through to the next attempt if a network error occurs.
    }

    // --- Attempt 2: "Plain Permalinks" Fallback URL ---
    try {
        const plainUrl = `${cleanedUrl}/?rest_route=/wp/v2/users/me`;
        const response = await tryConnection(plainUrl);

        if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
            return { success: true, message: 'Successfully connected to your WordPress site (using fallback URL).' };
        }
        
        let errorMessage;
        try {
            const errorBody = await response.json();
            errorMessage = errorBody.message || `API error with status ${response.status}.`;
        } catch (e) {
            errorMessage = 'WordPress did not return a valid JSON response. This can be caused by an incorrect URL, a firewall, a security plugin, or incorrect permalink settings.';
        }
        
        return { success: false, message: `Connection failed: ${errorMessage}` };

    } catch (error) {
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

        if (!response.ok) {
            let errorBody;
            try {
                errorBody = await response.json();
            } catch (e) {
                 throw new Error(`Failed to fetch media. WordPress returned a non-JSON response with status ${response.status}. This can be caused by an incorrect URL, a firewall, or a security plugin. Please also check your site's permalink settings.`);
            }
            throw new Error(errorBody.message || `Failed to fetch media with status ${response.status}.`);
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
        const text = await response.text();
        // Basic stripping of HTML tags. A more robust solution might be needed for complex sites.
        const plainText = text.replace(/<style[^>]*>.*<\/style>/gs, ' ')
                              .replace(/<script[^>]*>.*<\/script>/gs, ' ')
                              .replace(/<[^>]+>/g, ' ')
                              .replace(/\s+/g, ' ')
                              .trim();
        return { content: plainText };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}

export async function fetchWpPostsAndPages(site: WpSite, page: number = 1, perPage: number = 20): Promise<{items: WpPost[], totalItems?: number, error?: string}> {
    const { url, username, appPassword } = site;
    try {
        // Fetch both posts and pages in parallel
        const [postsResponse, pagesResponse] = await Promise.all([
            fetch(`${url}/wp-json/wp/v2/posts?page=${page}&per_page=${perPage}&_fields=id,title,link,type,meta&status=publish`, { 
                headers: { 'Authorization': getAuthHeader(username, appPassword) },
                cache: 'no-store',
            }),
            fetch(`${url}/wp-json/wp/v2/pages?page=${page}&per_page=${perPage}&_fields=id,title,link,type,meta&status=publish`, { 
                headers: { 'Authorization': getAuthHeader(username, appPassword) },
                cache: 'no-store',
            }),
        ]);

        if (!postsResponse.ok || !pagesResponse.ok) {
            // A simple error handling, can be improved to show which one failed
            throw new Error(`Failed to fetch content. Status - Posts: ${postsResponse.status}, Pages: ${pagesResponse.status}`);
        }

        const posts: WpPost[] = await postsResponse.json();
        const pages: WpPost[] = await pagesResponse.json();

        const totalPosts = parseInt(postsResponse.headers.get('X-WP-Total') || '0', 10);
        const totalPages = parseInt(pagesResponse.headers.get('X-WP-Total') || '0', 10);
        
        return { items: [...posts, ...pages], totalItems: totalPosts + totalPages };

    } catch (error) {
        console.error('WP Posts/Pages Fetch Error:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred while fetching content.';
        return { items: [], error: message };
    }
}

export async function updateWpPostMeta(site: WpSite, postId: number, metaDescription: string): Promise<{success: boolean, error?: string}> {
    const { url, username, appPassword } = site;
    try {
        // This targets the meta field used by the "All in One SEO" plugin.
        // If a different SEO plugin is used, this key might need to change.
        const response = await fetch(`${url}/wp-json/wp/v2/posts/${postId}`, {
            method: 'POST',
            headers: {
                'Authorization': getAuthHeader(username, appPassword),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                meta: {
                    _aioseo_description: metaDescription
                }
            }),
            cache: 'no-store',
        });
        
        if (!response.ok) {
             const errorBody = await response.json();
             // Handle cases where the post is a 'page'
             if (errorBody.code === 'rest_post_invalid_id') {
                 const pageResponse = await fetch(`${url}/wp-json/wp/v2/pages/${postId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': getAuthHeader(username, appPassword),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        meta: {
                            _aioseo_description: metaDescription
                        }
                    }),
                    cache: 'no-store',
                });
                if (!pageResponse.ok) {
                    const pageErrorBody = await pageResponse.json();
                    throw new Error(pageErrorBody.message || `Failed to update page item ${postId}.`);
                }
                return { success: true };
             }
            throw new Error(errorBody.message || `Failed to update post item ${postId}.`);
        }

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred while updating meta description.';
        return { success: false, error: message };
    }
}


export async function generateMetaDescriptionAction(
    apiKey: string, 
    pageContent: string,
    isWpContent: boolean = false
): Promise<{metaDescription: string, apiCalls: number} | {error: string, code?: string}> {
    try {
        if (!apiKey) {
            throw new Error('Gemini API key is not provided.');
        }

        let contentToProcess = pageContent;
        let apiCalls = 1;

        // If it's WordPress content, summarize it first to be more efficient
        if (isWpContent) {
            const summaryResult = await summarizeContentForMeta({apiKey, pageContent});
            contentToProcess = summaryResult.summary;
            apiCalls++; // Account for the summarization call
        }

        const { metaDescription } = await generateMetaDescription({ apiKey, pageContent: contentToProcess });
        return { metaDescription, apiCalls };
    } catch(error) {
        const handledError = handleGenerativeAiError(error);
        return { error: handledError.message, ...('code' in handledError && { code: (handledError as any).code }) };
    }
}
