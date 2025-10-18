
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { GeminiKeyDialog } from '@/components/gemini-key-dialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { connectWpSite, fetchWpMedia, generateAndSaveAltText, type WpSite, type WpMedia } from '@/app/actions';
import { Loader2, CheckCircle2, AlertCircle, ImageOff, Link, Wand2, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


type MediaStatus = 'pending' | 'generating' | 'success' | 'failed';
type WpMediaWithStatus = WpMedia & { status?: MediaStatus, error?: string };
type FilterType = 'all' | 'missing' | 'added';

const MEDIA_PER_PAGE = 20;

export default function WpAltText() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  
  const [wpSite, setWpSite] = useState<WpSite>({ url: '', username: '', appPassword: ''});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedSite, setConnectedSite] = useState<WpSite | null>(null);

  const [media, setMedia] = useState<WpMediaWithStatus[]>([]);
  const [totalMedia, setTotalMedia] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMedia, setIsFetchingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [hasMoreMedia, setHasMoreMedia] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [filter, setFilter] = useState<FilterType>('all');

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

  const handleConnect = async () => {
    if (!wpSite.url || !wpSite.username || !wpSite.appPassword) {
        setError("All fields are required.");
        return;
    }
    try {
        new URL(wpSite.url);
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
        handleFetchMedia(wpSite, true);
    } else {
        setError(result.message);
    }
  };

  const handleFetchMedia = async (site: WpSite, reset: boolean = false) => {
    setIsFetchingMedia(true);
    setMediaError(null);
    const pageToFetch = reset ? 1 : currentPage;
    if (reset) {
        setMedia([]);
        setCurrentPage(1);
        setHasMoreMedia(true);
    }
    const result = await fetchWpMedia(site, pageToFetch, MEDIA_PER_PAGE);
    
    if (result.error) {
        setMediaError(result.error);
    } else {
        setMedia(prev => reset ? result.media.map(m => ({...m, status: 'pending'})) : [...prev, ...result.media.map(m => ({...m, status: 'pending'}))]);
        if(result.totalMedia !== undefined) setTotalMedia(result.totalMedia);
        if (result.media.length < MEDIA_PER_PAGE) {
            setHasMoreMedia(false);
        } else {
            setHasMoreMedia(true);
        }
        setCurrentPage(page => page + 1);
    }
    setIsFetchingMedia(false);
  }

  const handleDisconnect = () => {
    setConnectedSite(null);
    setMedia([]);
    setTotalMedia(null);
    setCurrentPage(1);
    setHasMoreMedia(true);
    setWpSite({ url: '', username: '', appPassword: '' });
  }

  const handleGenerateAll = async () => {
    if (!connectedSite || !apiKey) return;

    const mediaToProcess = media.filter(item => !item.alt_text);
    if (mediaToProcess.length === 0) {
        toast({ title: "No Action Needed", description: "All visible images already have alt text."});
        return;
    }

    setIsGenerating(true);
    setProgress(0);

    let processedCount = 0;

    for (const item of mediaToProcess) {
        // Set status to 'generating'
        setMedia(prev => prev.map(m => m.id === item.id ? { ...m, status: 'generating' } : m));

        const result = await generateAndSaveAltText(apiKey, connectedSite, item);
        
        if ('newAltText' in result) {
            setMedia(prev => prev.map(m => m.id === result.id ? { ...m, alt_text: result.newAltText, status: 'success' } : m));
        } else {
            setMedia(prev => prev.map(m => m.id === result.id ? { ...m, status: 'failed', error: result.error } : m));
        }

        processedCount++;
        setProgress((processedCount / mediaToProcess.length) * 100);
    }

    setIsGenerating(false);
    toast({ title: "Processing Complete!", description: `Alt text generated for ${processedCount} images.` });
  }

  const filteredMedia = useMemo(() => {
    switch (filter) {
        case 'missing':
            return media.filter(item => !item.alt_text);
        case 'added':
            return media.filter(item => !!item.alt_text);
        default:
            return media;
    }
  }, [media, filter]);

  const mediaWithoutAltText = media.filter(m => !m.alt_text).length;

  const renderMediaItemContent = (item: WpMediaWithStatus) => {
        let statusBadge = null;
        let altTextDisplay = null;

        if (isGenerating) {
            switch (item.status) {
                case 'generating':
                    statusBadge = <Badge variant="secondary" className="w-full justify-center animate-pulse"><Wand2 className="mr-1 h-3 w-3" /> Generating...</Badge>;
                    break;
                case 'success':
                    statusBadge = <Badge className="w-full justify-center bg-green-500 hover:bg-green-600"><CheckCircle2 className="mr-1 h-3 w-3" /> Success</Badge>;
                    break;
                case 'failed':
                    statusBadge = <Badge variant="destructive" className="w-full justify-center"><AlertTriangle className="mr-1 h-3 w-3" /> Failed</Badge>;
                    break;
                default:
                    if (!item.alt_text) {
                        statusBadge = <Badge variant="outline" className="w-full justify-center">Pending</Badge>;
                    }
                    break;
            }
        }
        
        if (item.alt_text) {
            altTextDisplay = <p>Alt: <span className="text-foreground/80">{item.alt_text}</span></p>;
        } else if (!isGenerating) {
            altTextDisplay = <Badge variant="destructive" className="w-full justify-center">Missing Alt Text</Badge>;
        }

        return (
            <>
                {altTextDisplay}
                {statusBadge && <div className="mt-1">{statusBadge}</div>}
            </>
        )
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
                    <CardFooter className="flex justify-between">
                         <Button variant="outline" onClick={() => handleFetchMedia(connectedSite, true)} disabled={isFetchingMedia}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh Media
                         </Button>
                        <Button variant="outline" onClick={handleDisconnect}>Disconnect</Button>
                    </CardFooter>
                </Card>
            )}
        </div>

        {connectedSite && (
            <div className="mt-12">
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                    <div className='text-center md:text-left'>
                        <h2 className="text-2xl font-bold font-headline">
                            Media Library 
                            {totalMedia !== null && (
                                <Badge variant="secondary" className="ml-2 text-base">
                                    {totalMedia} {totalMedia === 1 ? 'item' : 'items'}
                                </Badge>
                            )}
                        </h2>
                        <p className="text-muted-foreground">Showing {filteredMedia.length} of {media.length} loaded images.</p>
                    </div>

                    <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                         <Button onClick={handleGenerateAll} disabled={isGenerating || mediaWithoutAltText === 0 || !isApiKeySet} className="w-full md:w-auto">
                            <Sparkles className="mr-2 h-4 w-4" />
                            {isGenerating ? 'Generating...' : `Generate for ${mediaWithoutAltText} missing`}
                        </Button>
                         <RadioGroup defaultValue="all" onValueChange={(value: FilterType) => setFilter(value)} className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="r1" />
                                <Label htmlFor="r1">All</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="missing" id="r2" />
                                <Label htmlFor="r2">Missing Alt Text</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="added" id="r3" />
                                <Label htmlFor="r3">Has Alt Text</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                 {isGenerating && (
                    <div className="mb-4 space-y-2">
                        <Label>Progress</Label>
                        <Progress value={progress} />
                        <p className="text-sm text-muted-foreground text-center">{Math.round(progress)}% complete</p>
                    </div>
                )}
                {isFetchingMedia && media.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : mediaError ? (
                    <Alert variant="destructive" className="max-w-2xl mx-auto">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Failed to load media</AlertTitle>
                        <AlertDescription>{mediaError}</AlertDescription>
                    </Alert>
                ) : media.length === 0 && !isFetchingMedia ? (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                        <ImageOff className="h-16 w-16 text-muted-foreground" />
                        <p className="text-muted-foreground mt-4">No images found in your media library.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {filteredMedia.map(item => (
                                <Card key={item.id} className="overflow-hidden group">
                                    <div className="aspect-square relative">
                                        <Image src={item.source_url} alt={item.alt_text || item.title.rendered} fill className="object-cover" data-ai-hint="wordpress library image" />
                                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white text-xs text-center">{item.title.rendered}</p>
                                        </div>
                                    </div>
                                    <CardContent className="p-2 text-xs space-y-1">
                                        {renderMediaItemContent(item)}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {filteredMedia.length === 0 && media.length > 0 && !isFetchingMedia && (
                            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground mt-4">No images match the current filter.</p>
                            </div>
                        )}

                        {hasMoreMedia && (
                            <div className="mt-8 text-center">
                                <Button onClick={() => handleFetchMedia(connectedSite)} disabled={isFetchingMedia}>
                                    {isFetchingMedia ? <Loader2 className="mr-2 animate-spin" /> : null}
                                    Load More
                                </Button>
                            </div>
                        )}
                    </>
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
