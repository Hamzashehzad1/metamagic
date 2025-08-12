
'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PartyPopper, Volume2, Download, FileAudio } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { textToSpeechAction } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleProcessing = async () => {
    if (!text) {
        toast({
            variant: 'destructive',
            title: 'No Text Provided',
            description: 'Please enter some text to convert to speech.',
        });
        return;
    }

    setIsLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
        const result = await textToSpeechAction(text);
        setAudioUrl(result.audioDataUri);
         toast({
            title: 'Success!',
            description: 'Your text has been converted to speech.',
            action: <PartyPopper/>
        });
    } catch (e) {
         const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(errorMessage);
        toast({
            variant: 'destructive',
            title: 'Processing Error',
            description: errorMessage,
        });
    } finally {
        setIsLoading(false);
    }
  };

   const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `speech.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header isConnected={true} onConnectClick={() => {}} />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
                Free AI Text to Speech
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
               Convert any text into natural-sounding speech with our free AI voice generator.
            </p>
        </section>

        <div className="max-w-2xl mx-auto space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle>Enter Your Text</CardTitle>
                    <CardDescription>
                       Type or paste the text you want to convert to speech below.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid w-full gap-1.5">
                        <Label htmlFor="message">Your text</Label>
                        <Textarea 
                            placeholder="Type your message here." 
                            id="message" 
                            value={text} 
                            onChange={(e) => setText(e.target.value)}
                            rows={6}
                        />
                    </div>
                    <Button onClick={handleProcessing} disabled={isLoading || !text} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Volume2 className="mr-2" />}
                        {isLoading ? `Generating...` : 'Generate Speech'}
                    </Button>
                </CardContent>
            </Card>

            {error && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {(isLoading || audioUrl) && (
                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           Generated Audio
                        </CardTitle>
                        <CardDescription>
                            Your audio file is ready. You can play or download it.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full rounded-lg border border-dashed flex items-center justify-center bg-muted/40 p-8">
                            {isLoading && (
                                <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10 rounded-lg">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                    <p className="mt-4 text-center font-medium">Generating Audio</p>
                                    <p className="text-sm text-muted-foreground">This may take a moment...</p>
                                </div>
                            )}
                            {!isLoading && audioUrl ? (
                                <audio controls src={audioUrl}>
                                    Your browser does not support the audio element.
                                </audio>
                            ) : (
                                !isLoading && 
                                <div className="text-center text-muted-foreground p-4">
                                    <FileAudio className="mx-auto h-12 w-12" />
                                    <p className="mt-2">Your generated audio will appear here.</p>
                                </div>
                            )}
                        </div>
                        {audioUrl && !isLoading && (
                             <Button onClick={downloadAudio} className="w-full mt-4">
                                <Download className="mr-2"/>
                                Download Audio (MP3)
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
           
        </div>
      </main>
       <footer className="py-4 px-4 md:px-6 border-t mt-16">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} MetaMagic. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
