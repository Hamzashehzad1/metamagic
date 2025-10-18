
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { GeminiKeyDialog } from '@/components/gemini-key-dialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { connectWpSite, fetchWpMedia, type WpSite, type WpMedia } from '@/app/actions';
import { Loader2, CheckCircle2, AlertCircle, ImageOff, Link } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function WpAltText() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  
  const [wpSite, setWpSite] = useState<WpSite>({ url: '', username: '', appPassword: ''});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedSite, setConnectedSite] = useState<WpSite | null>(null);

  const [media, setMedia] = useState<WpMedia[]>([]);
  const [isFetchingMedia, setIsFetchingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

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

  const handleConnect = async () => {
    if (!wpSite.url || !wpSite.username || !wpSite.appPassword) {
        setError("All fields are required.");
        return;
    }
    // Basic URL validation
    try {
        const url = new URL(wpSite.url);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            throw new Error();
        }
    } catch (e) {
        setError("Please enter a valid URL (e.g., https://example.com).");
        return;
    }


    setIsLoading(true);
    setError(null);
    const result = await connectWpSite(wpSite);
    setIsLoading(false);

    if (result.success) {
        setConnectedSite(wpSite);
        toast({ title: 'Success!', description: result.message });
        handleFetchMedia(wpSite);
    } else {
        setError(result.message);
    }
  };

  const handleFetchMedia = async (site: WpSite) => {
    setIsFetchingMedia(true);
    setMediaError(null);
    setMedia([]);
    const result = await fetchWpMedia(site);
    if (result.error) {
        setMediaError(result.error);
    } else {
        setMedia(result.media);
    }
    setIsFetchingMedia(false);
  }

  const handleDisconnect = () => {
    setConnectedSite(null);
    setMedia([]);
    setWpSite({ url: '', username: '', appPassword: '' });
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
                WordPress Alt Text Generator
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                Connect your WordPress site to automatically generate SEO-optimized alt text for your entire media library.
            </p>
        </section>

        <div className="max-w-2xl mx-auto">
            {!connectedSite ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Connect to WordPress</CardTitle>
                        <CardDescription>Enter your website URL, username, and an application password to get started.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Connection Failed</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="wp-url">WordPress Site URL</Label>
                            <Input id="wp-url" placeholder="https://example.com" value={wpSite.url} onChange={e => setWpSite({...wpSite, url: e.target.value.trim()})} disabled={isLoading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="wp-username">WordPress Username</Label>
                            <Input id="wp-username" placeholder="Enter your WordPress username" value={wpSite.username} onChange={e => setWpSite({...wpSite, username: e.target.value.trim()})} disabled={isLoading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="app-password">Application Password</Label>
                            <Input id="app-password" type="password" placeholder="Enter your application password" value={wpSite.appPassword} onChange={e => setWpSite({...wpSite, appPassword: e.target.value.trim()})} disabled={isLoading} />
                             <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1">
                                Need an Application Password?
                                <a href="https://wordpress.org/documentation/article/application-passwords/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary inline-flex items-center">
                                    Learn how to create one. <Link className="h-3 w-3 ml-1" />
                                </a>
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button className="w-full" onClick={handleConnect} disabled={isLoading || !isApiKeySet}>
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Connect Site'}
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="text-green-500" />
                            Site Connected
                        </CardTitle>
                        <CardDescription>
                            Successfully connected to <span className="font-semibold text-primary">{connectedSite.url}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" onClick={handleDisconnect}>Disconnect</Button>
                    </CardFooter>
                </Card>
            )}
        </div>

        {connectedSite && (
            <div className="mt-12">
                <h2 className="text-2xl font-bold font-headline mb-4 text-center">Media Library</h2>
                {isFetchingMedia ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : mediaError ? (
                    <Alert variant="destructive" className="max-w-2xl mx-auto">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Failed to load media</AlertTitle>
                        <AlertDescription>{mediaError}</AlertDescription>
                    </Alert>
                ) : media.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                        <ImageOff className="h-16 w-16 text-muted-foreground" />
                        <p className="text-muted-foreground mt-4">No images found in your media library.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {media.map(item => (
                            <Card key={item.id} className="overflow-hidden group">
                                <div className="aspect-square relative">
                                    <Image src={item.source_url} alt={item.title.rendered} fill className="object-cover" data-ai-hint="wordpress library image" />
                                     <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-xs text-center">{item.title.rendered}</p>
                                    </div>
                                </div>
                                <CardContent className="p-2 text-xs">
                                    {item.alt_text ? (
                                        <p>Alt: <span className="text-foreground/80">{item.alt_text}</span></p>
                                    ) : (
                                        <Badge variant="destructive" className="w-full justify-center">Missing Alt Text</Badge>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        )}

      </main>
      <footer className="py-4 px-4 md:px-6 border-t mt-16">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} MetaMagic. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
