
'use server';

/**
 * @fileOverview A flow for upscaling an image using Cloudinary.
 *
 * - upscaleImage - A function that handles the image upscaling process.
 * - UpscaleImageInput - The input type for the upscaleImage function.
 * - UpscaleImageOutput - The return type for the upscaleImage function.
 */
import {v2 as cloudinary} from 'cloudinary';
import {z} from 'zod';

cloudinary.config(); // Configures with CLOUDINARY_URL from .env

const UpscaleImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to upscale, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type UpscaleImageInput = z.infer<typeof UpscaleImageInputSchema>;

const UpscaleImageOutputSchema = z.object({
  upscaledPhotoDataUri: z
    .string()
    .describe(
      "The upscaled photo URL from Cloudinary."
    ),
});
export type UpscaleImageOutput = z.infer<typeof UpscaleImageOutputSchema>;


export async function upscaleImage(input: UpscaleImageInput): Promise<UpscaleImageOutput> {
    const { photoDataUri } = input;
    
    try {
        // Upload the image to Cloudinary and apply a generative enhancement.
        // The 'e_improve' effect is designed for AI-based enhancement and upscaling.
        const result = await cloudinary.uploader.upload(photoDataUri, {
            effect: "e_improve:mode=outdoor:blend=50",
        });

        if (!result || !result.secure_url) {
            throw new Error('Cloudinary did not return a valid image URL.');
        }

        return { upscaledPhotoDataUri: result.secure_url };

    } catch(error) {
        console.error("Error calling Cloudinary service:", error);
        throw new Error("Failed to upscale image via Cloudinary service.");
    }
}
