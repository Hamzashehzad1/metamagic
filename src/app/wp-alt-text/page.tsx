
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/header';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { connectWpSite, fetchWpMedia, generateAndSaveAltText, fetchAllWpMedia, type WpSite, type WpMedia } from '@/app/actions';
import { Loader2, CheckCircle2, AlertCircle, ImageOff, Link as LinkIcon, Wand2, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { addDoc, collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { type ApiKey, type WpConnection } from '@/app/account/page';
import AuthGuard from '@/components/auth-guard';

type MediaStatus = 'pending' | 'generating' | 'success' | 'failed';
type WpMediaWithStatus = WpMedia & { status?: MediaStatus, error?: string };
type FilterType = 'all' | 'missing' | 'added';

const MEDIA_PER_PAGE = 20;

function WpAltText() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  // Firestore data
  const apiKeysQuery = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/geminiApiKeys`) : null, [firestore, user]);
  const { data: apiKeys, isLoading: isLoadingKeys } = useCollection<ApiKey>(apiKeysQuery);
  
  const wpConnectionsQuery = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/wordpressConnections`) : null, [firestore, user]);
  const { data: wpConnections, isLoading: isLoadingConnections } = useCollection<WpConnection>(wpConnectionsQuery);

  const [activeKey, setActiveKey] = useState<ApiKey | null>(null);
  
  // Component state
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
  
  const isConnected = !!activeKey;

  useEffect(() => {
    if (apiKeys && apiKeys.length > 0) {
      const defaultKey = apiKeys.find(k => k.isDefault) || apiKeys[0];
      setActiveKey(defaultKey);
    } else {
      setActiveKey(null);
    }
  }, [apiKeys]);
  
  useEffect(() => {
    // Auto-connect if there's a saved connection
    if (wpConnections && wpConnections.length > 0 && !connectedSite) {
        const lastUsedConnection = wpConnections[0];
        handleConnect(lastUsedConnection);
    }
  }, [wpConnections, connectedSite]);


  const incrementUsage = useCallback(async (key: ApiKey, count: number) => {
    if (!user) return;
    const keyRef = doc(firestore, `users/${user.uid}/geminiApiKeys`, key.id);
    const today = new Date().toISOString().split('T')[0];
    const newUsage = key.lastUsed === today ? (key.usage || 0) + count : count;
    await setDoc(keyRef, { usage: newUsage, lastUsed: today }, { merge: true });
  }, [user, firestore]);


  const handleConnect = async (site: WpSite) => {
    setError(null);
    setMediaError(null);
    setIsLoading(true);

    const result = await connectWpSite(site);
    setIsLoading(false);

    if (result.success) {
        setConnectedSite(site);
        toast({ title: 'Success!', description: result.message });
        handleFetchMedia(site, true);
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

  const handleFetchAllMedia = async (site: WpSite) => {
      setIsFetchingMedia(true);
      setMediaError(null);
      setMedia([]);
      setCurrentPage(1);

      const result = await fetchAllWpMedia(site);

      if (result.error) {
          setMediaError(result.error);
      } else {
          setMedia(result.media.map(m => ({...m, status: 'pending'})));
          setTotalMedia(result.media.length);
          setHasMoreMedia(false);
          toast({ title: "All Media Loaded", description: `Found ${result.media.length} images.`});
      }
      setIsFetchingMedia(false);
  }

  const handleDisconnect = async () => {
    if (!user || !connectedSite || !wpConnections) return;
    const connectionToDelete = wpConnections.find(c => c.url === connectedSite.url);
    if (connectionToDelete) {
        await deleteDoc(doc(firestore, `users/${user.uid}/wordpressConnections`, connectionToDelete.id));
    }
    setConnectedSite(null);
    setMedia([]);
    setTotalMedia(null);
    setCurrentPage(1);
    setHasMoreMedia(true);
    setError(null);
    setMediaError(null);
  }

  const handleGenerateAll = async () => {
    if (!connectedSite || !activeKey) return;

    const mediaToProcess = media.filter(item => !item.alt_text);
    if (mediaToProcess.length === 0) {
        toast({ title: "No Action Needed", description: "All visible images already have alt text."});
        return;
    }

    setIsGenerating(true);
    setProgress(0);

    let processedCount = 0;
    let totalApiCalls = 0;

    for (const item of mediaToProcess) {
        setMedia(prev => prev.map(m => m.id === item.id ? { ...m, status: 'generating' } : m));

        const result = await generateAndSaveAltText(activeKey.key, connectedSite, item);
        
        if ('newAltText' in result) {
            totalApiCalls += result.apiCalls;
            setMedia(prev => prev.map(m => m.id === result.id ? { ...m, alt_text: result.newAltText, status: 'success' } : m));
        } else {
            if (result.code === 'GEMINI_QUOTA_EXCEEDED') {
                 toast({ variant: 'destructive', title: 'Quota Exceeded', description: result.error, duration: 5000 });
                 setIsGenerating(false);
                 if (totalApiCalls > 0) await incrementUsage(activeKey, totalApiCalls);
                 return;
            }
            setMedia(prev => prev.map(m => m.id === result.id ? { ...m, status: 'failed', error: result.error } : m));
        }

        processedCount++;
        setProgress((processedCount / mediaToProcess.length) * 100);
    }
    
    if (totalApiCalls > 0) await incrementUsage(activeKey, totalApiCalls);
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

  const mediaWithoutAltText = useMemo(() => media.filter(m => !m.alt_text).length, [media]);

  const hasNoKeys = !isLoadingKeys && apiKeys && apiKeys.length === 0;
  const hasNoConnections = !isLoadingConnections && wpConnections && wpConnections.length === 0;

  if (isLoadingConnections || isLoadingKeys) {
      return (
          <div className="flex flex-col min-h-screen bg-background">
              <Header />
              <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
          </div>
      )
  }

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
                    statusBadge = <Badge variant="destructive" className="w-full justify-center" title={item.error}><AlertTriangle className="mr-1 h-3 w-3" /> Failed</Badge>;
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
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
                WordPress Alt Text Generator
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                Connect your WordPress site to automatically generate SEO-optimized alt text for your entire media library.
            </p>
        </section>

        <div className="max-w-4xl mx-auto">
            {!connectedSite ? (
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Connect to WordPress</CardTitle>
                        <CardDescription>
                            {hasNoConnections
                                ? 'Add a new connection to get started.'
                                : 'Select a saved connection or add a new one.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Connection Failed</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {(hasNoKeys || hasNoConnections) && (
                             <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Configuration Needed</AlertTitle>
                                <AlertDescription>
                                To connect your WordPress site, please first go to your{' '}
                                <Link href="/account" className="font-semibold underline">Account settings</Link> and add at least one Gemini API key and one WordPress site connection.
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="flex flex-col gap-4">
                            {wpConnections?.map(site => (
                                <Button key={site.id} variant="outline" onClick={() => handleConnect(site)} disabled={isLoading || hasNoKeys}>
                                    Connect to {site.url}
                                </Button>
                            ))}
                        </div>

                    </CardContent>
                    <CardFooter>
                         <Button className="w-full" asChild>
                            <Link href="/account">Manage Connections</Link>
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
                         <Button onClick={handleGenerateAll} disabled={isGenerating || mediaWithoutAltText === 0 || !isConnected} className="w-full md:w-auto">
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
                                <Label htmlFor="r3">Has Alt Text</Label>                            </div>
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

                        <div className="mt-8 text-center flex justify-center gap-4">
                            {hasMoreMedia && (
                                <Button onClick={() => handleFetchMedia(connectedSite!)} disabled={isFetchingMedia}>
                                    {isFetchingMedia ? <Loader2 className="mr-2 animate-spin" /> : null}
                                    Load More
                                </Button>
                            )}
                             <Button onClick={() => handleFetchAllMedia(connectedSite!)} disabled={isFetchingMedia}>
                                {isFetchingMedia && media.length > 0 ? <Loader2 className="mr-2 animate-spin" /> : null}
                                Load All Media
                            </Button>
                        </div>
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

export default function WpAltTextPage() {
    return (
        <AuthGuard>
            <WpAltText />
        </AuthGuard>
    )
}
