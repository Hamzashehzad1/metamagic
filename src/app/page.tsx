
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/header';
import { FileUploader } from '@/components/file-uploader';
import { MetadataDisplay } from '@/components/metadata-display';
import { type Metadata, processFile } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { GeminiSettings } from '@/components/gemini-settings';
import { MetadataSettings, type MetadataSettings as TMetadataSettings } from '@/components/metadata-settings';


export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [metadataSettings, setMetadataSettings] = useState<TMetadataSettings>({
    titleLength: 60,
    keywordFormat: 'Mixed',
    keywordCount: 10,
    descriptionLength: 155,
    includeKeywords: '',
    excludeKeywords: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleFileUpload = useCallback((uploadedFile: File) => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    setFile(uploadedFile);
    setFileUrl(URL.createObjectURL(uploadedFile));
    setFileType(uploadedFile.type);
    setMetadata(null);
    setError(null);
  }, [fileUrl]);

  useEffect(() => {
    if (!file || !apiKey) return;

    if (!apiKey) {
      setError("Please enter your Gemini API key to proceed.");
      toast({
        variant: 'destructive',
        title: 'API Key Missing',
        description: "Please enter your Gemini API key to proceed.",
      });
      return;
    }

    const process = async () => {
      setIsLoading(true);
      
      try {
        setLoadingStatus('Converting file...');
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = async () => {
          try {
            const fileDataUri = reader.result as string;

            setLoadingStatus('Generating caption & SEO data...');
            const result = await processFile(apiKey, fileDataUri, metadataSettings);
            
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
        setLoadingStatus('');
      }
    };

    process();

  }, [file, apiKey, toast, metadataSettings]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
                Generate Perfect Media Metadata
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                Upload any image or video, and our AI will instantly write SEO-optimized titles, descriptions, and keywords to drive free traffic.
            </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-6">
             <GeminiSettings apiKey={apiKey} setApiKey={setApiKey} />
             <MetadataSettings settings={metadataSettings} onSettingsChange={setMetadataSettings} />
          </div>
          <div className="lg:col-span-8 grid gap-8">
             <FileUploader 
              onFileUpload={handleFileUpload}
              fileUrl={fileUrl}
              fileType={fileType}
              isLoading={isLoading}
              loadingStatus={loadingStatus}
              disabled={!apiKey}
            />
            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <MetadataDisplay metadata={metadata} isLoading={isLoading} />
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
