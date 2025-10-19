
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, ExternalLink, Trash2, Edit, Check, X, Star, Wand2, PlusCircle, Globe, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';
import AuthGuard from '@/components/auth-guard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { connectWpSite } from '../actions';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  usage: number;
  lastUsed: string; // ISO date string
}

export interface WpConnection {
    id: string;
    url: string;
    username: string;
    appPassword: string;
}

function AccountPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  // Gemini Keys state
  const apiKeysQuery = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/geminiApiKeys`) : null, [firestore, user]);
  const { data: apiKeys, isLoading: isLoadingKeys } = useCollection<ApiKey>(apiKeysQuery);
  
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [editedName, setEditedName] = useState('');
  
  // WP Connections state
  const wpConnectionsQuery = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/wordpressConnections`) : null, [firestore, user]);
  const { data: wpConnections, isLoading: isLoadingWpConnections } = useCollection<WpConnection>(wpConnectionsQuery);
  const [newWpUrl, setNewWpUrl] = useState('');
  const [newWpUsername, setNewWpUsername] = useState('');
  const [newWpAppPassword, setNewWpAppPassword] = useState('');
  const [isTestingWpConnection, setIsTestingWpConnection] = useState(false);
  const [showWpDialog, setShowWpDialog] = useState(false);


  // Handlers for Gemini Keys
  const handleAddKey = async () => {
    if (!newKeyName || !newKeyValue || !user) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please provide a name and a key.' });
      return;
    }
    const newKey = {
      name: newKeyName,
      key: newKeyValue,
      usage: 0,
      lastUsed: new Date().toISOString().split('T')[0],
      userId: user.uid
    };
    await addDoc(collection(firestore, `users/${user.uid}/geminiApiKeys`), newKey);
    setNewKeyName('');
    setNewKeyValue('');
    toast({ title: 'Success', description: `API Key "${newKey.name}" added.` });
  };
  
  const handleDeleteKey = async (keyId: string) => {
    if (!user) return;
    await deleteDoc(doc(firestore, `users/${user.uid}/geminiApiKeys`, keyId));
    toast({ title: 'Key Deleted', description: 'The API key has been removed.' });
  }

  const handleStartEdit = (key: ApiKey) => {
    setEditingKey(key);
    setEditedName(key.name);
  }

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditedName('');
  }

  const handleSaveEdit = async () => {
    if (!editingKey || !user) return;
    const keyRef = doc(firestore, `users/${user.uid}/geminiApiKeys`, editingKey.id);
    await setDoc(keyRef, { name: editedName }, { merge: true });
    setEditingKey(null);
    setEditedName('');
    toast({ title: 'Success', description: 'Key name updated.'});
  }
  
  const today = new Date().toISOString().split('T')[0];

  // Handlers for WP Connections
  const handleAddWpConnection = async () => {
      if (!newWpUrl || !newWpUsername || !newWpAppPassword || !user) {
          toast({ variant: 'destructive', title: 'Error', description: 'All WordPress connection fields are required.'});
          return;
      }
      try {
          new URL(newWpUrl);
      } catch (e) {
          toast({ variant: 'destructive', title: 'Invalid URL', description: 'Please enter a valid WordPress site URL.'});
          return;
      }

      setIsTestingWpConnection(true);

      const connectionDetails = {
          url: newWpUrl,
          username: newWpUsername,
          appPassword: newWpAppPassword,
      };

      const testResult = await connectWpSite(connectionDetails);

      if (testResult.success) {
          const newConnection = {
              ...connectionDetails,
              userId: user.uid,
          };
          await addDoc(collection(firestore, `users/${user.uid}/wordpressConnections`), newConnection);
          setNewWpUrl('');
          setNewWpUsername('');
          setNewWpAppPassword('');
          toast({ title: 'Success!', description: `Connection for "${newConnection.url}" was successful and has been saved.`});
          setShowWpDialog(false);
      } else {
          toast({ variant: 'destructive', title: 'Connection Failed', description: testResult.message, duration: 8000 });
      }

      setIsTestingWpConnection(false);
  };

  const handleDeleteWpConnection = async (connectionId: string) => {
      if (!user) return;
      await deleteDoc(doc(firestore, `users/${user.uid}/wordpressConnections`, connectionId));
      toast({ title: 'Connection Deleted', description: 'The WordPress connection has been removed.'});
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
                Account Settings
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                Manage your connected services and API keys.
            </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
            {/* Gemini API Keys Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="text-primary" /> Gemini API Keys
                    </CardTitle>
                    <CardDescription>
                        Add, select, and manage your Google AI API keys. Your keys are stored securely.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    <h3 className="text-lg font-semibold">Your Keys</h3>
                    {isLoadingKeys ? <p>Loading keys...</p> : apiKeys?.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">You haven't added any API keys yet.</p>
                    ) : (
                        apiKeys?.map(k => (
                        <div key={k.id} className="flex items-center gap-2 rounded-lg p-2 border bg-background hover:bg-muted/50">
                            {editingKey?.id === k.id ? (
                            <Input value={editedName} onChange={e => setEditedName(e.target.value)} className="h-8" />
                            ) : (
                            <>
                                <Button variant={'ghost'} size="sm" className="flex-1 justify-start gap-2">
                                    <span className="truncate">{k.name}</span>
                                </Button>
                                <div className="text-xs text-muted-foreground flex items-center gap-1" title={`API calls made today. Resets daily.`}>
                                    <Wand2 className="h-3 w-3" />
                                    <span>{k.lastUsed === today ? k.usage : 0} calls today</span>
                                </div>
                            </>
                            )}

                            <div className="flex items-center">
                            {editingKey?.id === k.id ? (
                                <>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveEdit}><Check className="h-4 w-4 text-green-500" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancelEdit}><X className="h-4 w-4 text-red-500" /></Button>
                                </>
                            ) : (
                                <>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStartEdit(k)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteKey(k.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </>
                            )}
                            </div>
                        </div>
                        ))
                    )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 items-stretch">
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline"><PlusCircle className="mr-2" />Add New Key</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Gemini API Key</DialogTitle>
                                <DialogDescription>
                                    Get your key from Google AI Studio.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="new-key-name">Key Name</Label>
                                    <Input id="new-key-name" placeholder="e.g., Personal Project Key" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="new-key-value">API Key</Label>
                                    <Input id="new-key-value" type="password" placeholder="Enter your Gemini API key" value={newKeyValue} onChange={e => setNewKeyValue(e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" onClick={handleAddKey} disabled={!newKeyName || !newKeyValue}>Add Key</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <p className="text-xs text-muted-foreground text-center">
                        <Link href="https://aistudio.google.com/apikey" target="_blank" className="underline hover:text-primary inline-flex items-center">
                            Need a new key? Get one here <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                    </p>
                </CardFooter>
            </Card>

            {/* WordPress Connections Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="text-primary" /> WordPress Connections
                    </CardTitle>
                    <CardDescription>
                        Manage your saved WordPress site connections.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                     <h3 className="text-lg font-semibold">Your Sites</h3>
                     {isLoadingWpConnections ? <p>Loading connections...</p> : wpConnections?.length === 0 ? (
                         <p className="text-sm text-muted-foreground text-center py-4">You have no saved WordPress sites.</p>
                     ) : (
                         wpConnections?.map(site => (
                             <div key={site.id} className="flex items-center justify-between gap-2 rounded-lg p-2 border bg-background">
                                 <span className="font-medium truncate">{site.url}</span>
                                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteWpConnection(site.id)}>
                                     <Trash2 className="h-4 w-4 text-destructive" />
                                 </Button>
                             </div>
                         ))
                     )}
                </CardContent>
                <CardFooter className="flex flex-col gap-4 items-stretch">
                    <Dialog open={showWpDialog} onOpenChange={setShowWpDialog}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><PlusCircle className="mr-2" />Add New Site</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add WordPress Connection</DialogTitle>
                                <DialogDescription>
                                    Your credentials will be tested before being saved. You'll need an application password for this.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="wp-url">Site URL</Label>
                                    <Input id="wp-url" placeholder="https://example.com" value={newWpUrl} onChange={e => setNewWpUrl(e.target.value.trim())} disabled={isTestingWpConnection}/>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="wp-username">Username</Label>
                                    <Input id="wp-username" placeholder="Your WP username" value={newWpUsername} onChange={e => setNewWpUsername(e.target.value.trim())} disabled={isTestingWpConnection} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="wp-app-password">Application Password</Label>
                                    <Input id="wp-app-password" type="password" placeholder="Enter your application password" value={newWpAppPassword} onChange={e => setNewWpAppPassword(e.target.value.trim())} disabled={isTestingWpConnection} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button 
                                    type="button" 
                                    onClick={handleAddWpConnection} 
                                    disabled={!newWpUrl || !newWpUsername || !newWpAppPassword || isTestingWpConnection}
                                >
                                    {isTestingWpConnection && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isTestingWpConnection ? 'Testing...' : 'Test & Add Connection'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <p className="text-xs text-muted-foreground text-center">
                        <a href="https://wordpress.org/documentation/article/application-passwords/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary inline-flex items-center">
                            How to create an Application Password <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                    </p>
                </CardFooter>
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


export default function AccountPageWithAuth() {
    return (
        <AuthGuard>
            <AccountPage />
        </AuthGuard>
    )
}

    