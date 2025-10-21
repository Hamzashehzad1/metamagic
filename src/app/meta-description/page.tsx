
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    fetchPageContent, 
    generateMetaDescriptionAction,
    connectWpSite,
    fetchWpPostsAndPages,
    updateWpPostMeta,
    type WpSite,
    type WpPost,
} from '@/app/actions';
import { Loader2, Link as LinkIcon, FileText, Wand2, Clipboard, ClipboardCheck, AlertCircle, CheckCircle2, RefreshCw, Sparkles, Database, Filter } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AuthGuard from '@/components/auth-guard';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { type ApiKey, type WpConnection } from '@/app/account/page';
import { collection, deleteDoc, doc, setDoc } from 'firebase/firestore';

type PostStatus = 'pending' | 'generating' | 'success' | 'failed';
type WpPostWithStatus = WpPost & { status?: PostStatus, error?: string };
type FilterType = 'all' | 'missing';

const POSTS_PER_PAGE = 20;

function MetaDescriptionPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  // Firestore data
  const apiKeysQuery = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/geminiApiKeys`) : null, [firestore, user]);
  const { data: apiKeys, isLoading: isLoadingKeys } = useCollection<ApiKey>(apiKeysQuery);

  const wpConnectionsQuery = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/wordpressConnections`) : null, [firestore, user]);
  const { data: wpConnections, isLoading: isLoadingConnections } = useCollection<WpConnection>(wpConnectionsQuery);
  
  // Active key state
  const [activeKey, setActiveKey] = useState<ApiKey | null>(null);
  
  // Manual Entry tab state
  const [url, setUrl] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metaDescription, setMetaDescription] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // WordPress tab state
  const [isWpLoading, setIsWpLoading] = useState(false);
  const [wpError, setWpError] = useState<string | null>(null);
  const [connectedSite, setConnectedSite] = useState<WpSite | null>(null);
  const [contentItems, setContentItems] = useState<WpPostWithStatus[]>([]);
  const [totalItems, setTotalItems] = useState<number | null>(null);
  const [wpCurrentPage, setWpCurrentPage] = useState(1);
  const [isFetchingContent, setIsFetchingContent] = useState(false);
  const [wpContentError, setWpContentError] = useState<string | null>(null);
  const [hasMoreContent, setHasMoreContent] = useState(true);
  const [wpFilter, setWpFilter] = useState<FilterType>('all');

  const isConnected = !!activeKey;

  // --- Common API Key & Connection Logic ---
  useEffect(() => {
    if (apiKeys && apiKeys.length > 0) {
      const defaultKey = apiKeys.find(k => k.isDefault) || apiKeys[0];
      setActiveKey(defaultKey);
    } else {
      setActiveKey(null);
    }
  }, [apiKeys]);
  
  useEffect(() => {
    if (wpConnections && wpConnections.length > 0 && !connectedSite) {
        handleWpConnect(wpConnections[0]);
    }
  }, [wpConnections, connectedSite]);

  const incrementUsage = useCallback(async (key: ApiKey, count: number) => {
    if (!user || !key) return;
    const keyRef = doc(firestore, `users/${user.uid}/geminiApiKeys`, key.id);
    const today = new Date().toISOString().split('T')[0];
    const newUsage = key.lastUsed === today ? (key.usage || 0) + count : count;
    await setDoc(keyRef, { usage: newUsage, lastUsed: today }, { merge: true });
  }, [user, firestore]);

  // --- Manual Entry Logic ---
  useEffect(() => {
    if(isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleGenerateFromUrl = async () => {
    if (!url) {
      setError("Please enter a URL.");
      return;
    }
    if (!activeKey) {
      toast({ variant: 'destructive', title: 'API Key Required', description: 'Please add an API key in your account.' });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setMetaDescription('');

    try {
      const result = await fetchPageContent(url);
      if ('error' in result) {
        throw new Error(result.error);
      }
      await handleGenerate(result.content, false);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not fetch content from the URL. Please check the link and try again.';
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
    if (!activeKey) {
      toast({ variant: 'destructive', title: 'API Key Required', description: 'Please add an API key in your account.' });
      return;
    }
    await handleGenerate(pastedContent, false);
  }

  const handleGenerate = async (content: string, isWpContent: boolean) => {
    setIsGenerating(true);
    setError(null);
    try {
      if (!activeKey) throw new Error("Missing API Key");

      const result = await generateMetaDescriptionAction(activeKey.key, content, isWpContent);
      if ('error' in result) {
          throw new Error(result.error);
      }
      await incrementUsage(activeKey, result.apiCalls);
      setMetaDescription(result.metaDescription);
      toast({ title: "Success!", description: "Meta description generated." });
    } catch(e) {
      setError('Could not generate a meta description. Please try again.');
      toast({ variant: 'destructive', title: 'Generation Error', description: "Could not generate a meta description. Please try again." });
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

  const canGenerate = !!activeKey && !isLoading && !isGenerating;

  // --- WordPress Logic ---
  const handleWpConnect = async (site: WpSite) => {
    setIsWpLoading(true);
    setWpError(null);
    const result = await connectWpSite(site);
    setIsWpLoading(false);

    if (result.success) {
        setConnectedSite(site);
        toast({ title: 'Success!', description: result.message });
        handleFetchContent(site, true);
    } else {
        setWpError('Connection failed. Please check your URL, username, and application password.');
    }
  };

  const handleFetchContent = async (site: WpSite, reset: boolean = false) => {
    setIsFetchingContent(true);
    setWpContentError(null);
    const pageToFetch = reset ? 1 : wpCurrentPage;
    if (reset) {
        setContentItems([]);
        setWpCurrentPage(1);
        setHasMoreContent(true);
    }
    const result = await fetchWpPostsAndPages(site, pageToFetch, POSTS_PER_PAGE);
    
    if (result.error) {
        setWpContentError('Could not fetch posts and pages. Please check your connection and permissions.');
    } else {
        const newItems = result.items.map(p => ({ ...p, status: 'pending' } as WpPostWithStatus));
        setContentItems(prev => reset ? newItems : [...prev, ...newItems]);
        if(result.totalItems !== undefined) setTotalItems(result.totalItems);
        if (result.items.length < POSTS_PER_PAGE * 2) { // *2 for posts and pages
            setHasMoreContent(false);
        } else {
            setHasMoreContent(true);
        }
        setWpCurrentPage(page => page + 1);
    }
    setIsFetchingContent(false);
  }

  const handleWpDisconnect = async () => {
    if (!user || !connectedSite || !wpConnections) return;
    const connectionToDelete = wpConnections.find(c => c.url === connectedSite.url);
    // Note: We are just disconnecting from the UI, not deleting the saved connection
    setConnectedSite(null);
    setContentItems([]);
    setTotalItems(null);
    setWpCurrentPage(1);
    setHasMoreContent(true);
    setWpError(null);
  }

  const handleGenerateSingleDescription = async (item: WpPostWithStatus) => {
    if (!connectedSite || !activeKey) return;
    
    setContentItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'generating' } : p));
    
    try {
        // 1. Fetch content from the post/page URL
        const contentResult = await fetchPageContent(item.link);
        if ('error' in contentResult) {
            throw new Error(contentResult.error);
        }

        // 2. Generate new meta description
        const generationResult = await generateMetaDescriptionAction(activeKey.key, contentResult.content, true);
        if ('error' in generationResult) {
            if (generationResult.code === 'GEMINI_QUOTA_EXCEEDED') {
              toast({ variant: 'destructive', title: 'Quota Exceeded', description: "Your Gemini API key quota has been exceeded.", duration: 5000 });
            }
            throw new Error(generationResult.error);
        }
        await incrementUsage(activeKey, generationResult.apiCalls);
        
        // 3. Update WordPress
        const updateResult = await updateWpPostMeta(connectedSite, item.id, generationResult.metaDescription);
        if (!updateResult.success) {
            throw new Error(updateResult.error);
        }
        
        setContentItems(prev => prev.map(p => p.id === item.id ? { ...p, meta: {...p.meta, _aioseo_description: generationResult.metaDescription }, status: 'success' } : p));
        toast({ title: "Success!", description: `Meta description updated for "${item.title.rendered}".` });

    } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to generate description. Please try again.";
        setContentItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'failed', error: message } : p));
        toast({ variant: 'destructive', title: `Error for "${item.title.rendered}"`, description: message, duration: 5000 });
    }
  };

  const filteredContent = useMemo(() => {
    return contentItems.filter(item => {
        if (wpFilter === 'missing') {
            return !item.meta?._aioseo_description;
        }
        return true;
    });
  }, [contentItems, wpFilter]);

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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
                AI Meta Description Generator
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                Generate compelling, SEO-friendly meta descriptions from a URL, pasted content, or directly from your WordPress site.
            </p>
        </section>

        <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="wordpress">WordPress</TabsTrigger>
            </TabsList>
            <TabsContent value="manual" className="mt-8">
                {hasNoKeys && (
                    <Alert className="mb-8 max-w-2xl mx-auto">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>API Key Required</AlertTitle>
                        <AlertDescription>
                        To generate meta descriptions, please first go to your{' '}
                        <Link href="/account" className="font-semibold underline">Account settings</Link> and add a Gemini API key.
                        </AlertDescription>
                    </Alert>
                )}
                <div className="grid gap-8 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Input Content</CardTitle>
                            <CardDescription>Provide content by URL or by pasting text.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="url" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="url"><LinkIcon className="mr-2"/>From URL</TabsTrigger>
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
            </TabsContent>
            <TabsContent value="wordpress" className="mt-8">
                <div className="max-w-4xl mx-auto">
                    {!connectedSite ? (
                        <Card className="max-w-2xl mx-auto">
                            <CardHeader>
                                <CardTitle>Connect to WordPress</CardTitle>
                                <CardDescription>Select a saved connection to fetch your posts and pages.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {wpError && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Connection Failed</AlertTitle>
                                        <AlertDescription>{wpError}</AlertDescription>
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
                                        <Button key={site.id} variant="outline" onClick={() => handleWpConnect(site)} disabled={isWpLoading || hasNoKeys}>
                                            {isWpLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
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
                        <div className="space-y-6">
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
                                    <Button variant="outline" onClick={() => handleFetchContent(connectedSite, true)} disabled={isFetchingContent}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Refresh Content
                                    </Button>
                                    <Button variant="outline" onClick={handleWpDisconnect}>Disconnect</Button>
                                </CardFooter>
                            </Card>

                             <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className='flex flex-col gap-1.5'>
                                            <h2 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
                                                <Database />
                                                Posts & Pages
                                                {totalItems !== null && <Badge variant="secondary">{totalItems} items</Badge>}
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                Showing {filteredContent.length} of {contentItems.length} loaded posts and pages. Descriptions from All-in-One SEO plugin are shown.
                                            </p>
                                        </div>
                                         <div className="flex items-center gap-4">
                                            <Label>Filter</Label>
                                            <RadioGroup defaultValue="all" onValueChange={(value: FilterType) => setWpFilter(value)} className="flex items-center">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="all" id="r-all" />
                                                    <Label htmlFor="r-all">All</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="missing" id="r-missing" />
                                                    <Label htmlFor="r-missing">Missing Description</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {isFetchingContent && contentItems.length === 0 ? (
                                        <div className="flex justify-center p-8"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
                                    ) : wpContentError ? (
                                        <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{wpContentError}</AlertDescription></Alert>
                                    ) : filteredContent.length === 0 ? (
                                         <div className="text-center p-8 text-muted-foreground">No posts or pages found that match the filter.</div>
                                    ) : (
                                        <div className="border rounded-md">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Title</TableHead>
                                                        <TableHead>Type</TableHead>
                                                        <TableHead>Current Meta Description</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredContent.map(item => (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="font-medium"><a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">{item.title.rendered}</a></TableCell>
                                                            <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
                                                            <TableCell className="text-muted-foreground text-sm max-w-xs truncate" title={item.meta._aioseo_description}>
                                                                {item.status === 'success' ? (
                                                                    <span className="text-green-600">{item.meta._aioseo_description}</span>
                                                                ) : (
                                                                    item.meta._aioseo_description || <span className='text-destructive'>None</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {item.status === 'generating' ? (
                                                                    <Button size="sm" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating</Button>
                                                                ) : item.status === 'success' ? (
                                                                     <Button size="sm" variant="ghost" className="text-green-600" disabled><CheckCircle2 className="mr-2 h-4 w-4" />Generated</Button>
                                                                ) : (
                                                                    <Button size="sm" variant="secondary" onClick={() => handleGenerateSingleDescription(item)} disabled={!isConnected}>
                                                                        <Sparkles className="mr-2 h-4 w-4" />Generate
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                     {hasMoreContent && !isFetchingContent && (
                                        <div className="mt-4 text-center">
                                            <Button onClick={() => handleFetchContent(connectedSite!)} disabled={isFetchingContent}>
                                                {isFetchingContent ? <Loader2 className="mr-2 animate-spin" /> : null}
                                                Load More
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                             </Card>
                        </div>
                    )}
                </div>
            </TabsContent>
        </Tabs>
      </main>
      <footer className="py-6 px-4 md:px-6 border-t mt-16">
        <div className="container mx-auto flex flex-col items-center gap-4">
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary hover:underline">Home</Link>
                <Link href="/#features" className="hover:text-primary hover:underline">Features</Link>
                <Link href="/pricing" className="hover:text-primary hover:underline">Pricing</Link>
                <Link href="/dashboard" className="hover:text-primary hover:underline">Dashboard</Link>
                <Link href="/wp-alt-text" className="hover:text-primary hover:underline">WP Alt Text</Link>
                <Link href="/meta-description" className="hover:text-primary hover:underline">Meta Description</Link>
                <Link href="/account" className="hover:text-primary hover:underline">Account</Link>
            </nav>
            <div className="text-center text-sm text-muted-foreground flex justify-center items-center gap-4">
                <p>&copy; {new Date().getFullYear()} MetaMagic. All Rights Reserved.</p>
                <Link href="/sitemap.xml" className="hover:underline">Sitemap</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}

export default function MetaDescriptionPageWithAuth() {
    return (
        <AuthGuard>
            <MetaDescriptionPage />
        </AuthGuard>
    )
}
