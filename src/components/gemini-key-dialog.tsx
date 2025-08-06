
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { KeyRound, ExternalLink } from 'lucide-react';

interface GeminiKeyDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (apiKey: string) => void;
}

export function GeminiKeyDialog({ isOpen, setIsOpen, onSave }: GeminiKeyDialogProps) {
  const [localApiKey, setLocalApiKey] = useState('');

  const handleSaveClick = () => {
    if (localApiKey) {
      onSave(localApiKey);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="text-primary" /> Connect to Gemini
          </DialogTitle>
          <DialogDescription>
            To use this application, you need a free Google AI API key. Your key is stored securely in your browser and never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Label htmlFor="api-key">Your Gemini API Key</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Enter your Gemini API key"
            value={localApiKey}
            onChange={(e) => setLocalApiKey(e.target.value)}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="outline" asChild>
            <Link href="https://aistudio.google.com/apikey" target="_blank">
              <ExternalLink className="mr-2" /> Get a Gemini Key
            </Link>
          </Button>
          <Button onClick={handleSaveClick} disabled={!localApiKey}>
            Save & Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
