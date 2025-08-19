

"use client";

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/header';
import { FileUploader } from '@/components/file-uploader';
import { MetadataDisplay } from '@/components/metadata-display';
import { type ProcessedFile, processFiles } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Wand2, Loader2 } from 'lucide-react';
import { MetadataSettings, type MetadataSettings as TMetadataSettings } from '@/components/metadata-settings';
import { GeminiKeyDialog } from '@/components/gemini-key-dialog';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);

  const [metadataSettings, setMetadataSettings] = useState<TMetadataSettings>({
    titleLength: 125,
    keywordFormat: 'Mixed',
    keywordCount: 50,
    descriptionLength: 250,
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

  const handleFileUpload = useCallback((uploadedFiles: File[]) => {
    if (!apiKey) {
      setIsApiKeyDialogOpen(true);
      toast({
        variant: 'destructive',
        title: 'Not Connected',
        description: 'Please connect your Gemini API key to upload files.'
      });
      return;
    }
    setFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
    setError(null);
  }, [apiKey, toast]);


  const handleGenerate = async () => {
    if (files.length === 0) {
      toast({ variant: 'destructive', title: 'No files uploaded', description: 'Please upload one or more files to generate metadata.' });
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
    setProcessedFiles([]);
    
    try {
      setLoadingStatus('Reading files...');
      const fileDataPromises = files.map(file => {
        return new Promise<{name: string, dataUri: string}>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve({ name: file.name, dataUri: reader.result as string });
            reader.onerror = (error) => reject(error);
        });
      });

      const fileData = await Promise.all(fileDataPromises);

      setLoadingStatus(`Generating metadata for ${files.length} file(s)...`);
      const results = await processFiles(apiKey, fileData, metadataSettings);
      
      setProcessedFiles(results);
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

  const handleClear = () => {
    setFiles([]);
    setProcessedFiles([]);
    setError(null);
  }
  
  const handleRemoveFile = (index: number) => {
    setFiles(files => files.filter((_, i) => i !== index));
  }

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
              files={files}
              isLoading={isLoading}
              loadingStatus={loadingStatus}
              disabled={!isApiKeySet}
              onRemoveFile={handleRemoveFile}
            />

            <div className="flex gap-4">
              <Button onClick={handleGenerate} disabled={isLoading || files.length === 0 || !isApiKeySet} size="lg" className="w-full">
                  {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                  {isLoading ? `Generating...` : `Generate Metadata for ${files.length} file(s)`}
              </Button>
              <Button onClick={handleClear} variant="outline" size="lg" disabled={isLoading || files.length === 0}>
                Clear All
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <MetadataDisplay processedFiles={processedFiles} isLoading={isLoading} />
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
