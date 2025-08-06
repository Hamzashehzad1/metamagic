import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// This is the global AI instance.
// When flows are defined, they will use this instance by default.
// The API key will be provided on a per-request basis inside each flow.
export const ai = genkit({
  plugins: [
    googleAI()
  ],
});
