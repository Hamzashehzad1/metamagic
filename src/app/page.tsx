
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/header';
import { FileUploader } from '@/components/file-uploader';
import { MetadataDisplay } from '@/components/metadata-display';
import { type ProcessedFile, processFiles, processUrl, type Metadata } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Wand2, Loader2 } from 'lucide-react';
import { MetadataSettings, type MetadataSettings as TMetadataSettings } from '@/components/metadata-settings';
import { GeminiKeyDialog, type ApiKey } from '@/components/gemini-key-dialog';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
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

  const activeKey = apiKeys.find(k => k.id === activeKeyId);
  const isConnected = !!activeKey;

  useEffect(() => {
    try {
      const storedKeys = localStorage.getItem('gemini-api-keys');
      const storedActiveId = localStorage.getItem('gemini-active-key-id');
      const keys = storedKeys ? JSON.parse(storedKeys) : [];
      setApiKeys(keys);
      if (storedActiveId) {
        setActiveKeyId(storedActiveId);
      } else if (keys.length > 0) {
        setActiveKeyId(keys[0].id);
      } else {
        // If no keys, open the dialog
        setIsApiKeyDialogOpen(true);
      }
    } catch (e) {
      console.error("Failed to parse API keys from localStorage", e);
      setIsApiKeyDialogOpen(true);
    }
  }, []);

  const handleKeysUpdate = (updatedKeys: ApiKey[], updatedActiveKeyId: string | null) => {
    const today = new Date().toISOString().split('T')[0];
    // When updating keys, also check if any usage counters need resetting
    const checkedKeys = updatedKeys.map(k => k.lastUsed === today ? k : { ...k, usage: 0, lastUsed: today });
    
    setApiKeys(checkedKeys);
    setActiveKeyId(updatedActiveKeyId);
    localStorage.setItem('gemini-api-keys', JSON.stringify(checkedKeys));
    if (updatedActiveKeyId) {
      localStorage.setItem('gemini-active-key-id', updatedActiveKeyId);
    } else {
      localStorage.removeItem('gemini-active-key-id');
    }
  };

  const incrementUsage = useCallback((count: number) => {
    if (!activeKeyId) return;
    const today = new Date().toISOString().split('T')[0];
    const updatedKeys = apiKeys.map(k => {
      if (k.id === activeKeyId) {
        const usageToday = k.lastUsed === today ? k.usage : 0;
        return { ...k, usage: usageToday + count, lastUsed: today };
      }
      return k;
    });
    // This will re-trigger the handleKeysUpdate logic
    handleKeysUpdate(updatedKeys, activeKeyId);
  }, [apiKeys, activeKeyId]);


  const handleFileUpload = useCallback((uploadedFiles: File[]) => {
    if (!isConnected) {
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
  }, [isConnected, toast]);


  const handleGenerate = async () => {
    if (files.length === 0) {
      toast({ variant: 'destructive', title: 'No files uploaded', description: 'Please upload one or more files to generate metadata.' });
      return;
    }
    if (!activeKey) {
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
      const result = await processFiles(activeKey.key, fileData, metadataSettings);
      
      if ('error' in result) {
        if ((result as any).code === 'GEMINI_QUOTA_EXCEEDED') {
            setError(result.error);
        }
        throw new Error(result.error);
      }
      
      incrementUsage(result.apiCalls);
      setProcessedFiles(result.results);

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during processing.';
       if (!error) { // Don't overwrite a more specific error
        setError(errorMessage);
      }
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

  // Handle pasted URL
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      if (!isConnected) {
        setIsApiKeyDialogOpen(true);
        toast({
            variant: 'destructive',
            title: 'Not Connected',
            description: 'Please connect your Gemini API key to paste an image URL.'
        });
        return;
      }
      
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf('text/plain') !== -1) {
          item.getAsString(async (text) => {
            const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;
            if (urlRegex.test(text)) {
              setIsLoading(true);
              setLoadingStatus('Fetching image from URL...');
              setError(null);
              
              const result = await processUrl(text);

              if ('error' in result) {
                setError(result.error);
                toast({ variant: 'destructive', title: 'URL Paste Error', description: result.error });
              } else {
                try {
                  const response = await fetch(result.dataUri);
                  const blob = await response.blob();
                  const newFile = new File([blob], result.name, { type: blob.type });
                  handleFileUpload([newFile]);
                  toast({ title: 'Image Pasted!', description: `Successfully loaded ${result.name} from URL.` });
                } catch(e) {
                  const err = e instanceof Error ? e.message : 'Could not process the fetched image.'
                  setError(err);
                  toast({ variant: 'destructive', title: 'Image Processing Error', description: err });
                }
              }
              setIsLoading(false);
              setLoadingStatus('');
            }
          });
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isConnected, toast, handleFileUpload]);

  const handleUpdateMetadata = (fileIndex: number, newMetadata: Metadata) => {
    setProcessedFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles[fileIndex] = { ...newFiles[fileIndex], metadata: newMetadata };
      return newFiles;
    });
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <GeminiKeyDialog 
        isOpen={isApiKeyDialogOpen}
        setIsOpen={setIsApiKeyDialogOpen}
        onKeysUpdate={handleKeysUpdate}
        apiKeys={apiKeys}
        activeKeyId={activeKeyId}
      />
      <Header isConnected={isConnected} onConnectClick={() => setIsApiKeyDialogOpen(true)} />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
                Generate Perfect Media Metadata
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                Upload images or <span className="font-semibold text-primary/80">paste an image URL (Ctrl+V)</span>. Our AI will instantly write SEO-optimized titles, descriptions, and keywords.
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
              disabled={!isConnected}
              onRemoveFile={handleRemoveFile}
            />

            <div className="flex gap-4">
              <Button onClick={handleGenerate} disabled={isLoading || files.length === 0 || !isConnected} size="lg" className="w-full">
                  {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                  {isLoading ? `Generating...` : `Generate Metadata for ${files.length} file(s)`}
              </Button>
              <Button onClick={handleClear} variant="outline" size="lg" disabled={isLoading || (files.length === 0 && processedFiles.length === 0)}>
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
            <MetadataDisplay 
                processedFiles={processedFiles} 
                isLoading={isLoading}
                onUpdateMetadata={handleUpdateMetadata} 
            />
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
