'use server';

/**
 * @fileOverview A flow to upscale an image using AI.
 *
 * - upscaleImage - A function that handles the image upscaling process.
 * - UpscaleImageInput - The input type for the upscaleImage function.
 * - UpscaleImageOutput - The return type for the upscaleImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UpscaleImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to upscale, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  upscaleFactor: z.number().describe('The factor by which to upscale the image (e.g., 2, 4, 8).'),
  sharpness: z.number().min(0).max(100).describe('Sharpness enhancement level (0-100).'),
  noiseReduction: z.number().min(0).max(100).describe('Noise reduction level (0-100).'),
  colorEnhancement: z.number().min(0).max(100).describe('Color enhancement level (0-100).'),
  brightness: z.number().min(0).max(100).describe('Brightness adjustment level (0-100).'),
  autoEnhance: z.boolean().describe('Whether to auto-enhance the image.'),
});
export type UpscaleImageInput = z.infer<typeof UpscaleImageInputSchema>;

const UpscaleImageOutputSchema = z.object({
  upscaledImageUri: z.string().describe('The upscaled image as a data URI.'),
});
export type UpscaleImageOutput = z.infer<typeof UpscaleImageOutputSchema>;

export async function upscaleImage(input: UpscaleImageInput): Promise<UpscaleImageOutput> {
  return upscaleImageFlow(input);
}

const upscaleImageFlow = ai.defineFlow(
  {
    name: 'upscaleImageFlow',
    inputSchema: UpscaleImageInputSchema,
    outputSchema: UpscaleImageOutputSchema,
  },
  async (input) => {
    let enhancementPrompt = '';
    if (input.autoEnhance) {
      enhancementPrompt = 'Automatically enhance the image to improve quality, clarity, and color balance.';
    } else {
      enhancementPrompt = `
- Upscale the image by a factor of ${input.upscaleFactor}x.
- Apply sharpness enhancement at a level of ${input.sharpness}%.
- Apply noise reduction at a level of ${input.noiseReduction}%.
- Apply color enhancement at a level of ${input.colorEnhancement}%.
- Adjust brightness by ${input.brightness}%.
Make the image look professional and high-resolution.
      `.trim();
    }

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: `You are an expert at enhancing images. ${enhancementPrompt}` },
      ],
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate upscaled image.');
    }

    return { upscaledImageUri: media.url };
  }
);
