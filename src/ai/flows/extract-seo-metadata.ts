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
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  imageCaption: z.string().describe('The caption of the image.'),
  ocrText: z.string().describe('The OCR text extracted from the image.'),
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

const prompt = ai.definePrompt({
  name: 'extractSeoMetadataPrompt',
  input: {schema: ExtractSeoMetadataInputSchema},
  output: {schema: ExtractSeoMetadataOutputSchema},
  prompt: `You are an SEO expert. Generate SEO keywords, a title, and a meta description for the image based on the following information:\n\nImage Caption: {{{imageCaption}}}\nOCR Text: {{{ocrText}}}\n\nSEO Keywords:`.trim(),
  postProcess: async (res, ctx) => {
    return res.output ? {
      ...res.output,
      seoKeywords: res.output.seoKeywords,
      seoTitle: res.output.seoTitle,
      seoDescription: res.output.seoDescription
    } : null;
  }
});

const extractSeoMetadataFlow = ai.defineFlow(
  {
    name: 'extractSeoMetadataFlow',
    inputSchema: ExtractSeoMetadataInputSchema,
    outputSchema: ExtractSeoMetadataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
