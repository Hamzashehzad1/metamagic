
'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { GeminiKeyDialog } from '@/components/gemini-key-dialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function WpAltText() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const { toast } = useToast();

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
            <Card>
                <CardHeader>
                    <CardTitle>Connect to WordPress</CardTitle>
                    <CardDescription>Enter your website URL and an application password to get started.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="wp-url">WordPress Site URL</Label>
                        <Input id="wp-url" placeholder="https://example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="app-password">Application Password</Label>
                        <Input id="app-password" type="password" placeholder="Enter your application password" />
                    </div>
                    <Button className="w-full">Connect Site</Button>
                </CardContent>
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
