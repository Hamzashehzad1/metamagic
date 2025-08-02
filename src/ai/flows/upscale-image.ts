'use server';

/**
 * @fileOverview A flow to upscale and enhance an image.
 *
 * - upscaleImage - A function that handles the image upscaling and enhancement process.
 * - UpscaleImageInput - The input type for the upscaleImage function.
 * - UpscaleImageOutput - The return type for the upscaleImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UpscaleImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to upscale, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
    upscaleFactor: z.enum(['2x', '4x', '8x']).default('2x'),
    sharpness: z.number().min(0).max(100).default(0),
    noiseReduction: z.number().min(0).max(100).default(0),
    colorEnhancement: z.number().min(0).max(100).default(0),
    brightness: z.number().min(0).max(100).default(0),
    autoEnhance: z.boolean().default(false),
});
export type UpscaleImageInput = z.infer<typeof UpscaleImageInputSchema>;

const UpscaleImageOutputSchema = z.object({
  upscaledImageUrl: z.string().describe('The data URI of the upscaled image.'),
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

    let enhancementPrompt = `You are an expert image editor. Upscale this image to a higher resolution (${input.upscaleFactor}), enhancing its quality and clarity while preserving the original details and composition. Do not change the content of the image.`;

    if (input.autoEnhance) {
      enhancementPrompt += `\n\nApply automatic enhancements to determine the optimal settings for sharpness, noise reduction, color enhancement, and brightness to make the image look its best.`
    } else {
      enhancementPrompt += `\n\nApply the following enhancement settings:
- Sharpness: ${input.sharpness}/100
- Noise Reduction: ${input.noiseReduction}/100
- Color Enhancement: ${input.colorEnhancement}/100
- Brightness: ${input.brightness}/100`;
    }

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        { text: enhancementPrompt },
        { media: { url: input.photoDataUri } }
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      }
    });
    
    if (!media?.url) {
      throw new Error('Image generation failed to return an upscaled image.');
    }

    return { upscaledImageUrl: media.url };
  }
);
