
'use server';

/**
 * @fileOverview A flow to summarize webpage content before meta description generation.
 *
 * - summarizeContentForMeta - A function that handles the content summarization.
 * - SummarizeContentInput - The input type for the function.
 * - SummarizeContentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeContentInputSchema = z.object({
  apiKey: z.string().describe("The user's Gemini API key."),
  pageContent: z
    .string()
    .describe('The full text content of the webpage to summarize.'),
});
export type SummarizeContentInput = z.infer<typeof SummarizeContentInputSchema>;

const SummarizeContentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key points of the page content, optimized for meta description generation.'),
});
export type SummarizeContentOutput = z.infer<typeof SummarizeContentOutputSchema>;

export async function summarizeContentForMeta(input: SummarizeContentInput): Promise<SummarizeContentOutput> {
  const { apiKey, ...rest } = input;
  return summarizeContentFlow(rest, { auth: apiKey });
}

const prompt = ai.definePrompt({
  name: 'summarizeContentForMetaPrompt',
  input: {schema: SummarizeContentInputSchema.omit({apiKey: true})},
  output: {schema: SummarizeContentOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert SEO analyst. Your task is to read the following webpage content and distill it into a short, potent summary. This summary will be used by another AI to write a meta description.

Focus on the most important topics, keywords, and the core value proposition of the content. Ignore boilerplate text like menus, footers, and ads. The output should be a dense paragraph of the most critical information.

Webpage Content:
---
{{{pageContent}}}
---
`,
});

const summarizeContentFlow = ai.defineFlow(
  {
    name: 'summarizeContentFlow',
    inputSchema: SummarizeContentInputSchema.omit({apiKey: true}),
    outputSchema: SummarizeContentOutputSchema,
  },
  async (promptData) => {
    // Truncate content to avoid hitting model context limits, focusing on the start of the content
    const truncatedContent = promptData.pageContent.substring(0, 15000);
    const {output} = await prompt({ ...promptData, pageContent: truncatedContent });
    return output!;
  }
);
