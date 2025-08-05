import {genkit, configure} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [],
  model: 'googleai/gemini-pro',
});

export function configureGenkit(apiKey: string) {
    configure({
        plugins: [
            googleAI({
                apiKey
            })
        ]
    });
}
