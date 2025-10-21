
'use server';

/**
 * @fileOverview A flow to generate a meta description for a webpage.
 *
 * - generateMetaDescription - A function that handles the meta description generation process.
 * - GenerateMetaDescriptionInput - The input type for the generateMetaDescription function.
 * - GenerateMetaDescriptionOutput - The return type for the generateMetaDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMetaDescriptionInputSchema = z.object({
  apiKey: z.string().describe("The user's Gemini API key."),
  pageContent: z
    .string()
    .describe('The full text content of the webpage.'),
});
export type GenerateMetaDescriptionInput = z.infer<typeof GenerateMetaDescriptionInputSchema>;

const GenerateMetaDescriptionOutputSchema = z.object({
  metaDescription: z.string().describe('A compelling, SEO-friendly meta description for the page, under 160 characters.'),
});
export type GenerateMetaDescriptionOutput = z.infer<typeof GenerateMetaDescriptionOutputSchema>;

export async function generateMetaDescription(input: GenerateMetaDescriptionInput): Promise<GenerateMetaDescriptionOutput> {
  const { apiKey, ...rest } = input;
  return generateMetaDescriptionFlow.withAuth({ apiKey })(rest);
}

const prompt = ai.definePrompt({
  name: 'generateMetaDescriptionPrompt',
  input: {schema: GenerateMetaDescriptionInputSchema.omit({apiKey: true})},
  output: {schema: GenerateMetaDescriptionOutputSchema},
  prompt: `You are an expert SEO copywriter. Analyze the following webpage content and write a compelling, SEO-friendly meta description.

Rules:
- The meta description must be a single paragraph.
- It must be under 160 characters.
- It should entice users to click by summarizing the page's key value proposition.
- Include a call-to-action if it feels natural.

Webpage Content:
---
{{{pageContent}}}
---
`,
});

const generateMetaDescriptionFlow = ai.defineFlow(
  {
    name: 'generateMetaDescriptionFlow',
    inputSchema: GenerateMetaDescriptionInputSchema.omit({apiKey: true}),
    outputSchema: GenerateMetaDescriptionOutputSchema,
  },
  async (promptData) => {
    // Truncate content to avoid hitting model context limits
    const truncatedContent = promptData.pageContent.substring(0, 10000);
    const {output} = await prompt({ ...promptData, pageContent: truncatedContent });
    return output!;
  }
);
