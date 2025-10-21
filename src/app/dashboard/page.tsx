
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
import { Button } from '@/components/ui/button';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import { type ApiKey } from '@/app/account/page';
import AuthGuard from '@/components/auth-guard';
import { AuthOverlay } from '@/components/auth-overlay';
import Link from 'next/link';


function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();

  const apiKeysQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/geminiApiKeys`);
  }, [firestore, user]);

  const { data: apiKeys } = useCollection<ApiKey>(apiKeysQuery);

  const [activeKey, setActiveKey] = useState<ApiKey | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [metadataSettings, setMetadataSettings] = useState<TMetadataSettings>({
    titleLength: 125,
    keywordFormat: 'Mixed',
    keywordCount: 50,
    descriptionLength: 250,
    includeKeywords: '',
    excludeKeywords: '',
  });
  const { toast } = useToast();

  const isConnected = !!activeKey;

  useEffect(() => {
    if (apiKeys && apiKeys.length > 0) {
      const defaultKey = apiKeys.find(k => k.isDefault) || apiKeys[0];
      setActiveKey(defaultKey);
    } else {
      setActiveKey(null);
    }
  }, [apiKeys]);


  const incrementUsage = useCallback(async (key: ApiKey, count: number) => {
    if (!user) return;
    const keyRef = doc(firestore, `users/${user.uid}/geminiApiKeys`, key.id);
    const today = new Date().toISOString().split('T')[0];
    const newUsage = key.lastUsed === today ? (key.usage || 0) + count : count;
    await setDoc(keyRef, { usage: newUsage, lastUsed: today }, { merge: true });
  }, [user, firestore]);


  const handleFileUpload = useCallback((uploadedFiles: File[]) => {
    if (!isConnected) {
       toast({
        variant: 'destructive',
        title: 'Not Connected',
        description: 'Please add a Gemini API key in your account page to upload files.'
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
       toast({
        variant: 'destructive',
        title: 'Not Connected',
        description: 'Please add and select a Gemini API key in your account page.'
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
        // Here we explicitly check for the error property.
        if (result.code === 'GEMINI_QUOTA_EXCEEDED') {
            toast({ variant: 'destructive', title: 'Quota Exceeded', description: "Your Gemini API key quota has been exceeded.", duration: 5000 });
        }
        throw new Error(result.error);
      }
      
      await incrementUsage(activeKey, result.apiCalls);
      setProcessedFiles(result.results);

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

  // Handle pasted URL
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      if (!user) return; // Only allow paste for logged-in users

      if (!isConnected) {
        toast({
            variant: 'destructive',
            title: 'Not Connected',
            description: 'Please add a Gemini API key to paste an image URL.'
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
                  const errMessage = e instanceof Error ? e.message : 'Could not process the fetched image.'
                  setError(errMessage);
                  toast({ variant: 'destructive', title: 'Image Processing Error', description: errMessage });
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
  }, [isConnected, toast, handleFileUpload, user]);

  const handleUpdateMetadata = (fileIndex: number, newMetadata: Metadata) => {
    setProcessedFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles[fileIndex] = { ...newFiles[fileIndex], metadata: newMetadata };
      return newFiles;
    });
  };

  const hasNoKeys = user && !isLoading && (!apiKeys || apiKeys.length === 0);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8 lg:p-12">
        <section className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter text-balance">
                Generate Perfect Media Metadata
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground text-balance">
                Upload your images or <span className="font-semibold text-primary/80">paste an image URL</span>. Our AI will instantly write SEO-optimized titles, descriptions, and keywords.
            </p>
        </section>
        
        <div className="relative">
          {!user && <AuthOverlay />}
          
          <div className={`grid gap-12 lg:grid-cols-12 ${!user ? 'blur-sm pointer-events-none' : ''}`}>
            <div className="lg:col-span-4 space-y-6">
              <MetadataSettings settings={metadataSettings} onSettingsChange={setMetadataSettings} />
            </div>
            <div className="lg:col-span-8 grid gap-8">
              <FileUploader 
                onFileUpload={handleFileUpload}
                files={files}
                isLoading={isLoading}
                loadingStatus={loadingStatus}
                disabled={!isConnected || !!hasNoKeys || !user}
                onRemoveFile={handleRemoveFile}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button onClick={handleGenerate} disabled={isLoading || files.length === 0 || !isConnected || !!hasNoKeys || !user} size="lg">
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
                  <AlertTitle>An Error Occurred</AlertTitle>
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
        </div>
      </main>
      <footer className="py-8 border-t bg-background mt-24">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
                <p className="text-sm font-semibold">&copy; {new Date().getFullYear()} MetaMagic. All Rights Reserved.</p>
                <p className="text-sm text-muted-foreground">An AI-powered SEO toolkit by <a href="https://webbrewery.co/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Web Brewery</a>.</p>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <Link href="/#features" className="hover:text-primary hover:underline">Features</Link>
                <Link href="/pricing" className="hover:text-primary hover:underline">Pricing</Link>
                <Link href="/dashboard" className="hover:text-primary hover:underline">Dashboard</Link>
            </nav>
        </div>
      </footer>
    </div>
  );
}

export default function DashboardPage() {
    return (
        <AuthGuard>
            <Dashboard />
        </AuthGuard>
    )
}

    