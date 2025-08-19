
'use server';

/**
 * @fileOverview A flow for extracting SEO metadata from an image.
 *
 * - extractSeoMetadata - A function that handles the SEO metadata extraction process.
 * - ExtractSeoMetadataInput - The input type for the extractSeoMetadata function.
 * - ExtractSeoMetadataOutput - The return type for the extractSeoMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractSeoMetadataInputSchema = z.object({
  apiKey: z.string().describe('The user\'s Gemini API key.'),
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  imageCaption: z.string().describe('The caption of the image.'),
  titleLength: z.number().optional().describe('The desired length of the SEO title.'),
  keywordFormat: z.enum(['Single Only', 'Double Only', 'Mixed']).optional().describe('The format for the SEO keywords.'),
  keywordCount: z.number().optional().describe('The desired number of SEO keywords.'),
  descriptionLength: z.number().optional().describe('The desired length of the SEO description.'),
  includeKeywords: z.string().optional().describe('A comma-separated list of keywords to include.'),
  excludeKeywords: z.string().optional().describe('A comma-separated list of keywords to exclude.'),
});
export type ExtractSeoMetadataInput = z.infer<typeof ExtractSeoMetadataInputSchema>;

const ExtractSeoMetadataOutputSchema = z.object({
  stockKeywords: z.string().describe('Comma-separated keywords for the stock photo website.'),
  stockTitle: z.string().describe('A short, impactful title for the stock photo.'),
  stockDescription: z.string().describe('A detailed description for the stock photo.'),
});
export type ExtractSeoMetadataOutput = z.infer<typeof ExtractSeoMetadataOutputSchema>;

export async function extractSeoMetadata(input: ExtractSeoMetadataInput): Promise<ExtractSeoMetadataOutput> {
  const { apiKey, ...rest } = input;
  return extractSeoMetadataFlow(rest, { auth: apiKey });
}

const prompt = ai.definePrompt({
  name: 'extractSeoMetadataPrompt',
  input: {schema: ExtractSeoMetadataInputSchema.omit({apiKey: true})},
  output: {schema: ExtractSeoMetadataOutputSchema},
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an expert at creating metadata for stock photography websites like Adobe Stock and Getty Images. Your goal is to maximize the visibility and saleability of the image.

Image Caption: {{{imageCaption}}}

Analyze the image and generate a title, description, and keywords optimized for stock photo sites.

Constraints:
- Title Length: Around {{{titleLength}}} characters. Make it concise and impactful.
- Description Length: Around {{{descriptionLength}}} characters. Describe the scene, subjects, and potential concepts.
- Number of Keywords: Exactly {{{keywordCount}}}.
- Keyword Format: {{{keywordFormat}}}.
- Must Include Keywords: {{{includeKeywords}}}.
- Must Exclude Keywords: {{{excludeKeywords}}}.

Generate the metadata based on these rules, focusing on commercial value and searchability.`,
});

const extractSeoMetadataFlow = ai.defineFlow(
  {
    name: 'extractSeoMetadataFlow',
    inputSchema: ExtractSeoMetadataInputSchema.omit({apiKey: true}),
    outputSchema: ExtractSeoMetadataOutputSchema,
  },
  async (promptData) => {
    const {output} = await prompt(promptData);
    return output!;
  }
);
