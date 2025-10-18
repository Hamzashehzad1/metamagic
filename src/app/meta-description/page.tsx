
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { GeminiKeyDialog } from '@/components/gemini-key-dialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fetchPageContent, generateMetaDescriptionAction } from '@/app/actions';
import { Loader2, Link, FileText, Wand2, Clipboard, ClipboardCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MetaDescriptionPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  
  const [url, setUrl] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metaDescription, setMetaDescription] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setIsApiKeySet(true);
    } else {
      setIsApiKeyDialogOpen(true);
    }
  }, []);

  useEffect(() => {
    if(isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleSaveApiKey = (newKey: string) => {
    if (!newKey) return;
    setApiKey(newKey);
    setIsApiKeySet(true);
    localStorage.setItem('gemini-api-key', newKey);
    setIsApiKeyDialogOpen(false);
    toast({
      title: 'API Key Saved',
      description: 'You are now connected to Gemini.',
    });
  };

  const handleGenerateFromUrl = async () => {
    if (!url) {
      setError("Please enter a URL.");
      return;
    }
    if (!apiKey) {
      setIsApiKeyDialogOpen(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setMetaDescription('');

    try {
      const result = await fetchPageContent(url);
      if (result.error) {
        throw new Error(result.error);
      }
      await handleGenerate(result.content);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(message);
      toast({ variant: 'destructive', title: 'Error Fetching URL', description: message });
    } finally {
      setIsLoading(false);
    }
  }

  const handleGenerateFromText = async () => {
    if (!pastedContent) {
        setError("Please paste some content.");
        return;
    }
    if (!apiKey) {
      setIsApiKeyDialogOpen(true);
      return;
    }
    await handleGenerate(pastedContent);
  }

  const handleGenerate = async (content: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateMetaDescriptionAction(apiKey!, content);
      if (result.error) {
          throw new Error(result.error);
      }
      setMetaDescription(result.metaDescription);
      toast({ title: "Success!", description: "Meta description generated." });
    } catch(e) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(message);
      toast({ variant: 'destructive', title: 'Generation Error', description: message });
    } finally {
      setIsGenerating(false);
    }
  }

  const handleCopy = () => {
    if (metaDescription) {
        navigator.clipboard.writeText(metaDescription);
        setIsCopied(true);
        toast({ title: 'Copied!' });
    }
  }

  const canGenerate = !!apiKey && !isLoading && !isGenerating;

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
                AI Meta Description Generator
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                Generate compelling, SEO-friendly meta descriptions for any webpage from a URL or by pasting its content.
            </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Input Content</CardTitle>
                    <CardDescription>Provide content by URL or by pasting text.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="url" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="url"><Link className="mr-2"/>From URL</TabsTrigger>
                            <TabsTrigger value="text"><FileText className="mr-2"/>From Text</TabsTrigger>
                        </TabsList>
                        <TabsContent value="url">
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="page-url">Page URL</Label>
                                    <Input id="page-url" placeholder="https://example.com/my-awesome-article" value={url} onChange={e => setUrl(e.target.value.trim())} disabled={!canGenerate} />
                                </div>
                                <Button className="w-full" onClick={handleGenerateFromUrl} disabled={!canGenerate || !url}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                                    {isLoading ? 'Fetching Content...' : 'Fetch & Generate'}
                                </Button>
                            </div>
                        </TabsContent>
                        <TabsContent value="text">
                            <div className="space-y-4 pt-4">
                                 <div className="space-y-2">
                                    <Label htmlFor="page-content">Page Content</Label>
                                    <Textarea 
                                        id="page-content" 
                                        placeholder="Paste the full text content of your page here." 
                                        value={pastedContent} 
                                        onChange={e => setPastedContent(e.target.value)} 
                                        disabled={!canGenerate}
                                        className="h-48"
                                    />
                                </div>
                                <Button className="w-full" onClick={handleGenerateFromText} disabled={!canGenerate || !pastedContent}>
                                    <Wand2 />
                                    Generate Description
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Generated Meta Description</CardTitle>
                    <CardDescription>The AI-generated meta description will appear here. Edit it as needed.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                     {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    
                    {isGenerating && !metaDescription && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                                <p className="mt-4 text-muted-foreground">Generating...</p>
                            </div>
                        </div>
                    )}
                    
                    {!isGenerating && !metaDescription && !error && (
                        <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                           <div className="text-center">
                             <p className="text-muted-foreground">Your meta description will appear here.</p>
                           </div>
                        </div>
                    )}

                    {metaDescription && (
                        <Textarea
                            value={metaDescription}
                            onChange={e => setMetaDescription(e.target.value)}
                            className="flex-1 text-base"
                            rows={6}
                        />
                    )}
                </CardContent>
                {metaDescription && (
                    <CardFooter>
                        <Button variant="outline" onClick={handleCopy} className="w-full">
                            {isCopied ? <ClipboardCheck /> : <Clipboard />}
                            {isCopied ? 'Copied!' : 'Copy to Clipboard'}
                        </Button>
                    </CardFooter>
                )}
            </Card>
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

    