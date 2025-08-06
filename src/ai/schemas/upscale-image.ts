import { z } from 'zod';

export const UpscaleImageInputSchema = z.object({
  apiKey: z.string().describe('The user\'s Gemini API key.'),
  photoDataUri: z
    .string()
    .describe(
      "A photo to upscale, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export const UpscaleImageOutputSchema = z.object({
  upscaledImageUri: z.string().describe('The data URI of the upscaled image.'),
});
