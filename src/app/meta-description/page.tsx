
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { GeminiKeyDialog, type ApiKey } from '@/components/gemini-key-dialog';
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

type PostStatus = 'pending' | 'generating' | 'success' | 'failed';
type WpPostWithStatus = WpPost & { status?: PostStatus, error?: string };
type FilterType = 'all' | 'missing';

const POSTS_PER_PAGE = 20;

export default function MetaDescriptionPage() {
  // Common state for API keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  
  // State for Manual Entry tab
  const [url, setUrl] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metaDescription, setMetaDescription] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // State for WordPress tab
  const [wpSite, setWpSite] = useState<WpSite>({ url: '', username: '', appPassword: ''});
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


  const { toast } = useToast();

  const activeKey = apiKeys.find(k => k.id === activeKeyId);
  const isConnected = !!activeKey;

  // --- Common API Key Logic ---
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
        setIsApiKeyDialogOpen(true);
      }
    } catch (e) {
      console.error("Failed to parse API keys from localStorage", e);
      setIsApiKeyDialogOpen(true);
    }
  }, []);

  const handleKeysUpdate = (updatedKeys: ApiKey[], updatedActiveKeyId: string | null) => {
    const today = new Date().toISOString().split('T')[0];
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
    const updatedKeys = apiKeys.map(k => 
      k.id === activeKeyId ? { ...k, usage: (k.lastUsed === new Date().toISOString().split('T')[0] ? k.usage : 0) + count, lastUsed: new Date().toISOString().split('T')[0] } : k
    );
    handleKeysUpdate(updatedKeys, activeKeyId);
  }, [apiKeys, activeKeyId]);

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
      await handleGenerate(result.content, false);
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
    if (!activeKey) {
      setIsApiKeyDialogOpen(true);
      return;
    }
    await handleGenerate(pastedContent, false);
  }

  const handleGenerate = async (content: string, isWpContent: boolean) => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateMetaDescriptionAction(activeKey!.key, content, isWpContent);
      if ('error' in result) {
          if ((result as any).code === 'GEMINI_QUOTA_EXCEEDED') {
            setError(result.error);
          }
          throw new Error(result.error);
      }
      incrementUsage(result.apiCalls);
      setMetaDescription(result.metaDescription);
      toast({ title: "Success!", description: "Meta description generated." });
    } catch(e) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      if (!error) {
        setError(message);
      }
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

  const canGenerate = !!activeKey && !isLoading && !isGenerating;

  // --- WordPress Logic ---
  const handleWpConnect = async () => {
    if (!wpSite.url || !wpSite.username || !wpSite.appPassword) {
        setWpError("All fields are required.");
        return;
    }
    try {
        new URL(wpSite.url);
    } catch (e) {
        setWpError("Please enter a valid URL (e.g., https://example.com).");
        return;
    }

    setIsWpLoading(true);
    setWpError(null);
    const result = await connectWpSite(wpSite);
    setIsWpLoading(false);

    if (result.success) {
        setConnectedSite(wpSite);
        toast({ title: 'Success!', description: result.message });
        handleFetchContent(wpSite, true);
    } else {
        setWpError(result.message);
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
        setWpContentError(result.error);
    } else {
        setContentItems(prev => reset ? result.items.map(p => ({...p, status: 'pending'})) : [...prev, ...result.items.map(p => ({...p, status: 'pending'}))]);
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

  const handleWpDisconnect = () => {
    setConnectedSite(null);
    setContentItems([]);
    setTotalItems(null);
    setWpCurrentPage(1);
    setHasMoreContent(true);
    setWpSite({ url: '', username: '', appPassword: '' });
  }

  const handleGenerateSingleDescription = async (item: WpPostWithStatus) => {
    if (!connectedSite || !activeKey) return;
    
    setContentItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'generating' } : p));
    
    try {
        // 1. Fetch content from the post/page URL
        const contentResult = await fetchPageContent(item.link);
        if (contentResult.error) throw new Error(contentResult.error);

        // 2. Generate new meta description
        const generationResult = await generateMetaDescriptionAction(activeKey.key, contentResult.content, true);
        if (generationResult.error) throw new Error(generationResult.error);
        incrementUsage(generationResult.apiCalls);
        
        // 3. Update WordPress
        const updateResult = await updateWpPostMeta(connectedSite, item.id, generationResult.metaDescription);
        if (!updateResult.success) throw new Error(updateResult.error);
        
        setContentItems(prev => prev.map(p => p.id === item.id ? { ...p, meta: {...p.meta, _aioseo_description: generationResult.metaDescription }, status: 'success' } : p));
        toast({ title: "Success!", description: `Meta description updated for "${item.title.rendered}".` });

    } catch (e) {
        const message = e instanceof Error ? e.message : "An unknown error occurred.";
        setContentItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'failed', error: message } : p));
        toast({ variant: 'destructive', title: `Error for "${item.title.rendered}"`, description: message });
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
                                <CardDescription>Enter your website URL, username, and an application password to fetch posts and pages.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {wpError && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Connection Failed</AlertTitle>
                                        <AlertDescription>{wpError}</AlertDescription>
                                    </Alert>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="wp-url-meta">WordPress Site URL</Label>
                                    <Input id="wp-url-meta" placeholder="https://example.com" value={wpSite.url} onChange={e => setWpSite({...wpSite, url: e.target.value.trim()})} disabled={isWpLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="wp-username-meta">WordPress Username</Label>
                                    <Input id="wp-username-meta" placeholder="Enter your WordPress username" value={wpSite.username} onChange={e => setWpSite({...wpSite, username: e.target.value.trim()})} disabled={isWpLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="app-password-meta">Application Password</Label>
                                    <Input id="app-password-meta" type="password" placeholder="Enter your application password" value={wpSite.appPassword} onChange={e => setWpSite({...wpSite, appPassword: e.target.value.trim()})} disabled={isWpLoading} />
                                    <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1">
                                        Need an Application Password?
                                        <a href="https://wordpress.org/documentation/article/application-passwords/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary inline-flex items-center">
                                            Learn how to create one. <LinkIcon className="h-3 w-3 ml-1" />
                                        </a>
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={handleWpConnect} disabled={isWpLoading || !isConnected}>
                                    {isWpLoading ? <Loader2 className="animate-spin" /> : 'Connect Site'}
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
                                    <CardTitle className="flex items-center justify-between">
                                        <div className='flex items-center gap-2'>
                                            <Database />
                                            Posts & Pages
                                            {totalItems !== null && <Badge variant="secondary">{totalItems} items</Badge>}
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
                                    </CardTitle>
                                    <CardDescription>
                                        Showing {filteredContent.length} of {contentItems.length} loaded posts and pages. Descriptions from All-in-One SEO plugin are shown.
                                    </CardDescription>
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
                                            <Button onClick={() => handleFetchContent(connectedSite)} disabled={isFetchingContent}>
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
      <footer className="py-4 px-4 md:px-6 border-t mt-16">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} MetaMagic. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
