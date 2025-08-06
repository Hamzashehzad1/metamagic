'use server';

/**
 * @fileOverview A flow for extracting SEO metadata from an image.
 *
 * - extractSeoMetadata - A function that handles the SEO metadata extraction process.
 * - ExtractSeoMetadataInput - The input type for the extractSeoMetadata function.
 * - ExtractSeoMetadataOutput - The return type for the extractSeoMetadata function.
 */

import {ai} from '@/ai/genkit';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
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
  seoKeywords: z.string().describe('SEO keywords for the image.'),
  seoTitle: z.string().describe('SEO title for the image.'),
  seoDescription: z.string().describe('SEO description for the image.'),
});
export type ExtractSeoMetadataOutput = z.infer<typeof ExtractSeoMetadataOutputSchema>;

export async function extractSeoMetadata(input: ExtractSeoMetadataInput): Promise<ExtractSeoMetadataOutput> {
  return extractSeoMetadataFlow(input);
}

const extractSeoMetadataFlow = ai.defineFlow(
  {
    name: 'extractSeoMetadataFlow',
    inputSchema: ExtractSeoMetadataInputSchema,
    outputSchema: ExtractSeoMetadataOutputSchema,
  },
  async (input) => {
    const { apiKey, ...promptData } = input;
    const client = genkit({
      plugins: [googleAI({ apiKey })],
    });

    const prompt = client.definePrompt({
      name: 'extractSeoMetadataPrompt',
      input: {schema: ExtractSeoMetadataInputSchema.omit({apiKey: true})},
      output: {schema: ExtractSeoMetadataOutputSchema},
      model: 'googleai/gemini-2.0-flash',
      prompt: `You are an SEO expert. Generate SEO keywords, a title, and a meta description for an image based on the following caption and constraints.

Image Caption: {{{imageCaption}}}

Constraints:
- SEO Title Length: Around {{{titleLength}}} characters.
- SEO Description Length: Around {{{descriptionLength}}} characters.
- Number of Keywords: Exactly {{{keywordCount}}}.
- Keyword Format: {{{keywordFormat}}}.
- Must Include Keywords: {{{includeKeywords}}}.
- Must Exclude Keywords: {{{excludeKeywords}}}.

Generate the SEO metadata based on these rules.
`,
    });

    const {output} = await prompt(promptData);
    return output!;
  }
);
