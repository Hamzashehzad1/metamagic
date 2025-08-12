
'use server';

/**
 * @fileOverview A flow for converting text to speech using ElevenLabs.
 * - textToSpeech - A function that handles the TTS process.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import { z } from 'zod';
import fetch from 'node-fetch';

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
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = '21m00Tcm4TlvDq8ikWAM'; // A default voice, e.g., "Rachel"

  if (!apiKey) {
    throw new Error('ElevenLabs API key is not configured.');
  }

  const endpointUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  
  const options = {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
        }
    }),
  };

  try {
    const response = await fetch(endpointUrl, options);
    
    if (!response.ok) {
        const errorBody = await response.json();
        const errorMessage = errorBody.detail?.message || 'Unknown error from ElevenLabs API';
        throw new Error(`External API Error: ${errorMessage}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioDataUri = `data:audio/mpeg;base64,${Buffer.from(audioBuffer).toString('base64')}`;
    
    return { audioDataUri };
  } catch (error) {
    console.error('Error in textToSpeech flow:', error);
     if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error('Failed to convert text to speech via external service.');
  }
}
