
'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Download, Image as ImageIcon, Loader2, PartyPopper, Scissors } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { removeBackgroundAction } from '@/app/actions';

export default function BackgroundRemoverPage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalFileUrl, setOriginalFileUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback((uploadedFile: File) => {
    if (originalFileUrl) {
      URL.revokeObjectURL(originalFileUrl);
    }
    setOriginalFile(uploadedFile);
    setOriginalFileUrl(URL.createObjectURL(uploadedFile));
    setProcessedImageUrl(null);
    setError(null);
  }, [originalFileUrl]);

  const handleProcessing = async () => {
    if (!originalFileUrl || !originalFile) {
        toast({
            variant: 'destructive',
            title: 'No Image Selected',
            description: 'Please upload an image to remove the background.',
        });
        return;
    }

    setIsLoading(true);
    setError(null);
    setProcessedImageUrl(null);

    try {
        const reader = new FileReader();
        reader.readAsDataURL(originalFile);
        reader.onload = async () => {
            const fileDataUri = reader.result as string;
            try {
                const result = await removeBackgroundAction(fileDataUri);
                setProcessedImageUrl(result.processedPhotoDataUri);
                 toast({
                    title: 'Success!',
                    description: 'The background has been removed.',
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
        }
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
    if (processedImageUrl) {
      const a = document.createElement('a');
      a.href = processedImageUrl;
      a.download = `background-removed-${originalFile?.name || 'image.png'}`;
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
                Free AI Background Remover
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
               Instantly remove the background from any image with a single click.
            </p>
        </section>

        <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
                 <FileUploader 
                    onFileUpload={handleFileUpload}
                    fileUrl={originalFileUrl}
                    fileType={originalFile ? originalFile.type : null}
                    isLoading={isLoading}
                    loadingStatus="Removing background..."
                    accept={{'image/*': ['.jpeg', '.png', '.gif', '.webp']}}
                    dropzoneText="Only images are supported"
                />
                 <Card>
                    <CardHeader>
                        <CardTitle>Remove Background</CardTitle>
                        <CardDescription>
                           Click the button below to remove the background from your image.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleProcessing} disabled={isLoading || !originalFile} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Scissors className="mr-2" />}
                            {isLoading ? `Processing...` : 'Remove Background'}
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
                           Processed Image
                        </CardTitle>
                        <CardDescription>
                            The image with the background removed will appear here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full aspect-video rounded-lg border border-dashed flex items-center justify-center bg-muted/40">
                            {isLoading && (
                                <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10 rounded-lg">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                    <p className="mt-4 text-center font-medium">Removing Background</p>
                                    <p className="text-sm text-muted-foreground">This may take a moment...</p>
                                </div>
                            )}
                            {processedImageUrl && !isLoading ? (
                                <Image src={processedImageUrl} alt="Processed Image" fill className="object-contain rounded-lg p-2" />
                            ) : (
                                <div className="text-center text-muted-foreground p-4">
                                    <ImageIcon className="mx-auto h-12 w-12" />
                                    <p className="mt-2">Upload an image and click "Remove Background" to see the result.</p>
                                </div>
                            )}
                        </div>
                        {processedImageUrl && !isLoading && (
                             <Button onClick={downloadImage} className="w-full mt-4">
                                <Download className="mr-2"/>
                                Download Image
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
