
'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { GeminiKeyDialog } from '@/components/gemini-key-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { upscaleImageAction } from '@/app/actions';

export default function UpscalerPage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalFileUrl, setOriginalFileUrl] = useState<string | null>(null);
  const [upscaledImageUrl, setUpscaledImageUrl] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  
  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setIsApiKeySet(true);
    }
  }, []);

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    setIsApiKeySet(true);
    localStorage.setItem('gemini-api-key', newKey);
    setIsApiKeyDialogOpen(false);
    toast({
      title: 'API Key Saved',
      description: 'You are now connected to Gemini.',
    });
  };

  const handleFileUpload = useCallback((uploadedFile: File) => {
    if (originalFileUrl) {
      URL.revokeObjectURL(originalFileUrl);
    }
    if (upscaledImageUrl) {
        URL.revokeObjectURL(upscaledImageUrl);
    }
    setOriginalFile(uploadedFile);
    setOriginalFileUrl(URL.createObjectURL(uploadedFile));
    setUpscaledImageUrl(null);
    setError(null);
  }, [originalFileUrl, upscaledImageUrl]);

  const handleProcessing = async () => {
    if (!originalFile) {
        toast({
            variant: 'destructive',
            title: 'No Image Uploaded',
            description: 'Please upload an image to start upscaling.',
        });
        return;
    }

    setIsLoading(true);
    setError(null);
    setUpscaledImageUrl(null);

    try {
        const reader = new FileReader();
        reader.readAsDataURL(originalFile);
        reader.onload = async () => {
            try {
                const fileDataUri = reader.result as string;
                const { upscaledPhotoDataUri } = await upscaleImageAction(fileDataUri);
                setUpscaledImageUrl(upscaledPhotoDataUri);
            } catch (e) {
                 const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during upscaling.';
                setError(errorMessage);
                toast({
                    variant: 'destructive',
                    title: 'Upscaling Error',
                    description: errorMessage,
                });
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
            throw new Error('Failed to read file.');
        };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(errorMessage);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: errorMessage,
        });
        setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (upscaledImageUrl) {
      const a = document.createElement('a');
      a.href = upscaledImageUrl;
      a.download = `upscaled-${originalFile?.name || 'image.png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <GeminiKeyDialog
        isOpen={isApiKeyDialogOpen}
        setIsOpen={setIsApiKeyDialogOpen}
        onSave={handleSaveApiKey}
      />
      <Header isConnected={isApiKeySet} onConnectClick={() => setIsApiKeyDialogOpen(true)} />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
                Transform Your Images with AI Upscaling
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                Enhance your photos with GFPGAN, an advanced AI for realistic face restoration and beautiful upscaling.
            </p>
        </section>

        <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
                 <FileUploader 
                    onFileUpload={handleFileUpload}
                    fileUrl={originalFileUrl}
                    fileType={originalFile ? originalFile.type : null}
                    isLoading={isLoading}
                    loadingStatus="Upscaling with AI..."
                    accept={{'image/*': ['.jpeg', '.png', '.gif', '.webp']}}
                    dropzoneText="Only images are supported for upscaling"
                />
                 <Card>
                    <CardHeader>
                        <CardTitle>Upscale Image</CardTitle>
                        <CardDescription>
                           Click the button below to upscale your image using the GFPGAN model.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleProcessing} disabled={isLoading || !originalFile} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                            {isLoading ? `Upscaling...` : 'Upscale with AI'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-8">
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <Card className="shadow-lg h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           Upscaled Image
                        </CardTitle>
                        <CardDescription>
                            Your enhanced image will appear here after processing.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full aspect-video rounded-lg border border-dashed flex items-center justify-center bg-muted/40">
                            {isLoading && (
                                <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10 rounded-lg">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                    <p className="mt-4 text-center font-medium">Upscaling with AI</p>
                                    <p className="text-sm text-muted-foreground">This may take a moment...</p>
                                </div>
                            )}
                            {upscaledImageUrl && !isLoading ? (
                                <Image src={upscaledImageUrl} alt="Upscaled Image" fill className="object-contain rounded-lg p-2" />
                            ) : (
                                <div className="text-center text-muted-foreground p-4">
                                    <ImageIcon className="mx-auto h-12 w-12" />
                                    <p className="mt-2">Upload an image and click "Upscale Image" to see the magic.</p>
                                </div>
                            )}
                        </div>
                        {upscaledImageUrl && !isLoading && (
                             <Button onClick={downloadImage} className="w-full mt-4">
                                <Download className="mr-2"/>
                                Download Upscaled Image
                            </Button>
                        )}
                    </CardContent>
                </Card>
             </div>
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
