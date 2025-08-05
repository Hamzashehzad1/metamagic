'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Check, ExternalLink } from 'lucide-react';

interface GeminiSettingsProps {
    apiKey: string | null;
    setApiKey: (key: string | null) => void;
}

export function GeminiSettings({ apiKey, setApiKey }: GeminiSettingsProps) {
    const [localApiKey, setLocalApiKey] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if(apiKey) {
            setLocalApiKey(apiKey);
        }
    }, [apiKey]);

    const handleSave = () => {
        if (localApiKey) {
            setApiKey(localApiKey);
            localStorage.setItem('gemini-api-key', localApiKey);
            toast({
                title: 'API Key Saved',
                description: 'Your Gemini API key has been saved to your browser\'s local storage.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'No API Key',
                description: 'Please enter an API key to save.',
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <KeyRound className="text-primary" /> Gemini API Key
                </CardTitle>
                <CardDescription>
                    To use this application, you need a free Google AI API key. Your key is stored securely in your browser.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="api-key">Your API Key</Label>
                    <Input
                        id="api-key"
                        type="password"
                        placeholder="Enter your Gemini API key"
                        value={localApiKey}
                        onChange={(e) => setLocalApiKey(e.target.value)}
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                     <Button onClick={handleSave} className="w-full">
                        <Check /> Save Key
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="https://aistudio.google.com/apikey" target="_blank">
                           <ExternalLink /> Get a Gemini Key
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}