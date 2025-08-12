
'use server';

/**
 * @fileOverview A flow for converting text to speech.
 * - textToSpeech - A function that handles the TTS process.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import { z } from 'zod';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe("The text to convert to speech."),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe('The audio file as a data URI.'),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  const { text } = input;
  const apiKey = process.env.TTS_API_KEY;

  if (!apiKey) {
    throw new Error('TTS API key is not configured.');
  }

  const endpointUrl = 'https://voicerss-text-to-speech.p.rapidapi.com/?key=_API_KEY_';
  
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'voicerss-text-to-speech.p.rapidapi.com'
    },
    body: new URLSearchParams({
        src: text,
        hl: 'en-us',
        r: '0',
        c: 'MP3',
        f: '8khz_8bit_mono'
    }),
    agent: new HttpsProxyAgent('https://proxy.dev.internal:3128')
  };

  try {
    // @ts-ignore
    const response = await fetch(endpointUrl, options);
    if (!response.ok) {
        const errorBody = await response.text();
        // The API returns the audio directly on success, but an error message on failure
        if (errorBody.startsWith('ERROR')) {
            throw new Error(`External API Error: ${errorBody}`);
        }
       throw new Error(`External API Error: ${response.status} ${response.statusText}`);
    }

    const audioBuffer = await response.buffer();
    const audioDataUri = `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`;
    
    return { audioDataUri };
  } catch (error) {
    console.error('Error in textToSpeech flow:', error);
    throw new Error('Failed to convert text to speech via external service.');
  }
}
