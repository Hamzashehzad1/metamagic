
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { KeyRound, ExternalLink, Trash2, Edit, Check, X, Star, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  usage: number;
  lastUsed: string; // ISO date string
}

interface GeminiKeyDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onKeysUpdate: (keys: ApiKey[], activeKeyId: string | null) => void;
  apiKeys: ApiKey[];
  activeKeyId: string | null;
}

export function GeminiKeyDialog({ isOpen, setIsOpen, onKeysUpdate, apiKeys, activeKeyId }: GeminiKeyDialogProps) {
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [editedName, setEditedName] = useState('');

  const { toast } = useToast();

  const handleAddKey = () => {
    if (!newKeyName || !newKeyValue) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please provide a name and a key.' });
      return;
    }
    const newKey: ApiKey = {
      id: self.crypto.randomUUID(),
      name: newKeyName,
      key: newKeyValue,
      usage: 0,
      lastUsed: new Date().toISOString().split('T')[0],
    };
    const updatedKeys = [...apiKeys, newKey];
    // If it's the first key being added, make it active
    const newActiveKeyId = activeKeyId ?? newKey.id;
    onKeysUpdate(updatedKeys, newActiveKeyId);
    setNewKeyName('');
    setNewKeyValue('');
    toast({ title: 'Success', description: `API Key "${newKey.name}" added.` });
  };
  
  const handleDeleteKey = (keyId: string) => {
    const updatedKeys = apiKeys.filter(k => k.id !== keyId);
    let newActiveKeyId = activeKeyId;
    if (activeKeyId === keyId) {
      newActiveKeyId = updatedKeys.length > 0 ? updatedKeys[0].id : null;
    }
    onKeysUpdate(updatedKeys, newActiveKeyId);
    toast({ title: 'Key Deleted', description: 'The API key has been removed.' });
  }
  
  const handleSetActiveKey = (keyId: string) => {
    onKeysUpdate(apiKeys, keyId);
    toast({ title: 'Active Key Changed' });
  }

  const handleStartEdit = (key: ApiKey) => {
    setEditingKey(key);
    setEditedName(key.name);
  }

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditedName('');
  }

  const handleSaveEdit = () => {
    if (!editingKey) return;
    const updatedKeys = apiKeys.map(k => k.id === editingKey.id ? { ...k, name: editedName } : k);
    onKeysUpdate(updatedKeys, activeKeyId);
    setEditingKey(null);
    setEditedName('');
    toast({ title: 'Success', description: 'Key name updated.'});
  }
  
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="text-primary" /> Manage Gemini API Keys
          </DialogTitle>
          <DialogDescription>
            Add, select, and manage your Google AI API keys. Your keys are stored securely in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
            <h3 className="text-lg font-semibold">Add New Key</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                <div className="space-y-1">
                    <Label htmlFor="new-key-name">Key Name</Label>
                    <Input id="new-key-name" placeholder="e.g., Personal Key" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="new-key-value">API Key</Label>
                    <Input id="new-key-value" type="password" placeholder="Enter your Gemini API key" value={newKeyValue} onChange={e => setNewKeyValue(e.target.value)} />
                </div>
                <Button onClick={handleAddKey} disabled={!newKeyName || !newKeyValue}>
                    Add Key
                </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center md:text-right">
                <Link href="https://aistudio.google.com/apikey" target="_blank" className="underline hover:text-primary inline-flex items-center">
                    Need a new key? Get one here <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
            </p>
        </div>

        <Separator />
        
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          <h3 className="text-lg font-semibold">Your Keys</h3>
          {apiKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">You haven't added any API keys yet.</p>
          ) : (
            apiKeys.map(k => (
              <div key={k.id} className="flex items-center gap-2 rounded-lg p-2 border bg-background hover:bg-muted/50">
                {editingKey?.id === k.id ? (
                  <Input value={editedName} onChange={e => setEditedName(e.target.value)} className="h-8" />
                ) : (
                  <>
                    <Button variant={activeKeyId === k.id ? 'default' : 'ghost'} size="sm" className="flex-1 justify-start gap-2" onClick={() => handleSetActiveKey(k.id)}>
                        {activeKeyId === k.id && <Star className="h-4 w-4 text-amber-400" />}
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

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
