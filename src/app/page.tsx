"use client";

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/header';
import { ImageUploader } from '@/components/image-uploader';
import { MetadataDisplay } from '@/components/metadata-display';
import { type Metadata, processImage } from '@/app/actions';
import Tesseract from 'tesseract.js';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = useCallback((file: File) => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setMetadata(null);
    setError(null);
  }, [imageUrl]);

  useEffect(() => {
    if (!imageFile) return;

    const process = async () => {
      setIsLoading(true);
      
      try {
        setLoadingStatus('Converting image...');
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);

        reader.onload = async () => {
          try {
            const photoDataUri = reader.result as string;

            setLoadingStatus('Extracting text with OCR...');
            const { data: { text: ocrText } } = await Tesseract.recognize(
              imageFile,
              'eng',
              { logger: m => console.log(m) }
            );

            setLoadingStatus('Generating caption & SEO data...');
            const result = await processImage(photoDataUri, ocrText);
            
            setMetadata(result);
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during processing.';
            setError(errorMessage);
            toast({
              variant: 'destructive',
              title: 'Processing Error',
              description: errorMessage,
            });
          } finally {
            setIsLoading(false);
            setLoadingStatus('');
          }
        };

        reader.onerror = () => {
          throw new Error('Failed to read image file.');
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
        setLoadingStatus('');
      }
    };

    process();

  }, [imageFile, toast]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <ImageUploader 
              onImageUpload={handleImageUpload}
              imageUrl={imageUrl}
              isLoading={isLoading}
              loadingStatus={loadingStatus}
            />
          </div>
          <div className="lg:col-span-3">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <MetadataDisplay metadata={metadata} isLoading={isLoading} />
          </div>
        </div>
      </main>
      <footer className="py-4 px-4 md:px-6 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Powered by MetaMagic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
