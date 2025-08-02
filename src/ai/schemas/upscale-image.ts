/**
 * @fileOverview Zod schemas and TypeScript types for the image upscaling flow.
 *
 * - UpscaleImageInputSchema - The Zod schema for the input of the upscaleImage flow.
 * - UpscaleImageInput - The TypeScript type for the input of the upscaleImage flow.
 * - UpscaleImageOutputSchema - The Zod schema for the output of the upscaleImage flow.
 * - UpscaleImageOutput - The TypeScript type for the output of the upscaleImage flow.
 */
import {z} from 'genkit';

export const UpscaleImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to upscale, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  magnification: z
    .number()
    .describe(
      'The factor by which to magnify the image, e.g., 2 for 2x upscaling.'
    ),
});
export type UpscaleImageInput = z.infer<typeof UpscaleImageInputSchema>;

export const UpscaleImageOutputSchema = z.object({
  upscaledPhotoDataUri: z.string().describe('The upscaled photo as a data URI.'),
});
export type UpscaleImageOutput = z.infer<typeof UpscaleImageOutputSchema>;
