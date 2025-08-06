
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/header';
import { FileUploader } from '@/components/file-uploader';
import { MetadataDisplay } from '@/components/metadata-display';
import { type Metadata, processFile } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Wand2, Loader2 } from 'lucide-react';
import { MetadataSettings, type MetadataSettings as TMetadataSettings } from '@/components/metadata-settings';
import { GeminiKeyDialog } from '@/components/gemini-key-dialog';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);

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
    if (!apiKey) {
      setIsApiKeyDialogOpen(true);
      toast({
        variant: 'destructive',
        title: 'Not Connected',
        description: 'Please connect your Gemini API key to upload files.'
      });
      return;
    }
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    setFile(uploadedFile);
    setFileUrl(URL.createObjectURL(uploadedFile));
    setFileType(uploadedFile.type);
    setMetadata(null);
    setError(null);
  }, [apiKey, fileUrl, toast]);


  const handleGenerate = async () => {
    if (!file) {
      toast({ variant: 'destructive', title: 'No file uploaded', description: 'Please upload a file to generate metadata.' });
      return;
    }
    if (!apiKey) {
      setIsApiKeyDialogOpen(true);
      toast({
        variant: 'destructive',
        title: 'Not Connected',
        description: 'Please connect your Gemini API key to generate metadata.'
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
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
                Generate Perfect Media Metadata
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                Upload any image or video, and our AI will instantly write SEO-optimized titles, descriptions, and keywords to drive free traffic.
            </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-6">
             <MetadataSettings settings={metadataSettings} onSettingsChange={setMetadataSettings} />
          </div>
          <div className="lg:col-span-8 grid gap-8">
             <FileUploader 
              onFileUpload={handleFileUpload}
              fileUrl={fileUrl}
              fileType={fileType}
              isLoading={isLoading}
              loadingStatus={loadingStatus}
              disabled={!isApiKeySet}
            />

            <Button onClick={handleGenerate} disabled={isLoading || !file || !isApiKeySet} size="lg" className="w-full">
                {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                {isLoading ? 'Generating...' : 'Generate Metadata'}
            </Button>
            
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
