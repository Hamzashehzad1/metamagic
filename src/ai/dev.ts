
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-image-caption.ts';
import '@/ai/flows/extract-seo-metadata.ts';
import '@/ai/flows/upscale-image.ts';
import '@/ai/flows/remove-background.ts';
import '@/ai/flows/text-to-speech.ts';
