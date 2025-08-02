"use client";

import { type Metadata } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { MetadataCard } from './metadata-card';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import Image from 'next/image';

interface MetadataDisplayProps {
  metadata: Metadata | null;
  isLoading: boolean;
  imageUrl: string | null;
}

export function MetadataDisplay({ metadata, isLoading, imageUrl }: MetadataDisplayProps) {

  const exportAs = (type: 'json' | 'txt') => {
    if (!metadata) return;

    let content = '';
    let filename = '';
    let mimeType = '';

    if (type === 'json') {
      content = JSON.stringify(metadata, null, 2);
      filename = 'metadata.json';
      mimeType = 'application/json';
    } else {
      const { caption, seoKeywords, seoTitle, seoDescription } = metadata;
      content = `Image Caption:\n${caption}\n\nSEO Keywords:\n${seoKeywords}\n\nSEO Title:\n${seoTitle}\n\nSEO Description:\n${seoDescription}`;
      filename = 'metadata.txt';
      mimeType = 'text/plain';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Generated Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!metadata) {
    return (
      <div className="flex items-center justify-center h-full rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Upload an image to magically generate metadata.</p>
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-xl md:text-2xl">Generated Metadata</CardTitle>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => exportAs('json')}>
                <Download className="mr-2 h-4 w-4" /> JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportAs('txt')}>
                <Download className="mr-2 h-4 w-4" /> TXT
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {imageUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <Image src={imageUrl} alt="Uploaded image" layout="fill" objectFit="contain" data-ai-hint="uploaded image" />
            </div>
        )}
        <MetadataCard title="AI Generated Caption" content={metadata.caption} />
        <MetadataCard title="SEO Keywords" content={metadata.seoKeywords} />
        <MetadataCard title="SEO Title" content={metadata.seoTitle} />
        <MetadataCard title="SEO Description" content={metadata.seoDescription} />
      </CardContent>
    </Card>
  );
}
