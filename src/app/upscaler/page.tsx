"use client";

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { upscaleImageAction } from '@/app/actions';

export default function UpscalerPage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback((uploadedFile: File) => {
    if (originalUrl) {
      URL.revokeObjectURL(originalUrl);
    }
    setOriginalFile(uploadedFile);
    setOriginalUrl(URL.createObjectURL(uploadedFile));
    setUpscaledUrl(null);
    setError(null);
  }, [originalUrl]);

  const handleUpscale = async () => {
    if (!originalFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(originalFile);

      reader.onload = async () => {
        try {
          const fileDataUri = reader.result as string;
          const result = await upscaleImageAction(fileDataUri);
          setUpscaledUrl(result.upscaledImageUrl);
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
  
  const handleDownload = () => {
    if (!upscaledUrl) return;
    const a = document.createElement('a');
    a.href = upscaledUrl;
    a.download = 'upscaled_image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
            AI Image Upscaler
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            Enhance your images to a higher resolution with incredible detail and clarity. Upload a low-resolution photo and watch our AI work its magic.
          </p>
        </section>

        <div className="max-w-md mx-auto mb-8">
            <FileUploader
                onFileUpload={handleFileUpload}
                fileUrl={originalUrl}
                fileType={originalFile?.type || null}
                isLoading={isLoading && !upscaledUrl}
                loadingStatus="Uploading..."
                accept={{ 'image/*': ['.jpeg', '.png', '.webp'] }}
                dropzoneText="Only image files are supported"
            />
        </div>

        {originalFile && (
            <div className="text-center mb-12">
                <Button onClick={handleUpscale} disabled={isLoading} size="lg">
                {isLoading ? 'Upscaling...' : 'Upscale Image'}
                </Button>
            </div>
        )}
        
        {error && (
            <Alert variant="destructive" className="mb-4 max-w-4xl mx-auto">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold text-center mb-4">Original Image</h2>
            <div className="border rounded-lg p-2 aspect-square flex items-center justify-center bg-muted/20">
              {originalUrl ? (
                <Image src={originalUrl} alt="Original" width={512} height={512} className="object-contain max-h-full rounded-md" />
              ) : (
                <p className="text-muted-foreground">Upload an image to begin</p>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-4">
                <h2 className="text-2xl font-bold text-center">Upscaled Image</h2>
                {upscaledUrl && (
                    <Button variant="outline" size="sm" onClick={handleDownload} className="ml-4">
                        <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                )}
            </div>
            <div className="border rounded-lg p-2 aspect-square flex items-center justify-center bg-muted/20">
              {isLoading && !upscaledUrl && <Skeleton className="w-full h-full" />}
              {!isLoading && !upscaledUrl && <p className="text-muted-foreground">Your upscaled image will appear here</p>}
              {upscaledUrl && (
                <Image src={upscaledUrl} alt="Upscaled" width={1024} height={1024} className="object-contain max-h-full rounded-md" />
              )}
            </div>
          </div>
        </div>
      </main>
      <footer className="py-4 px-4 md:px-6 border-t mt-16">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Powered by MetaMagic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
