
"use client";

import { type Metadata } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { MetadataCard } from './metadata-card';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

interface MetadataDisplayProps {
  metadata: Metadata | null;
  isLoading: boolean;
  filename: string | null;
}

export function MetadataDisplay({ metadata, isLoading, filename }: MetadataDisplayProps) {

  const exportAs = (type: 'json' | 'txt') => {
    if (!metadata) return;

    let content = '';
    let exportFilename = '';
    let mimeType = '';

    if (type === 'json') {
      content = JSON.stringify(metadata, null, 2);
      exportFilename = 'metadata.json';
      mimeType = 'application/json';
    } else {
      const { caption, stockKeywords, stockTitle, stockDescription } = metadata;
      content = `Image Caption:\n${caption}\n\nStock Keywords:\n${stockKeywords}\n\nStock Title:\n${stockTitle}\n\nStock Description:\n${stockDescription}`;
      exportFilename = 'metadata.txt';
      mimeType = 'text/plain';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsCsv = () => {
    if (!metadata || !filename) return;

    const { stockTitle, stockDescription, stockKeywords } = metadata;

    // Adobe Stock CSV headers: Filename,Title,Description,Keywords
    const headers = 'Filename,Title,Description,Keywords';
    // Escape commas and quotes in metadata
    const escapeCsvField = (field: string) => `"${field.replace(/"/g, '""')}"`;
    
    const row = [
      filename,
      escapeCsvField(stockTitle),
      escapeCsvField(stockDescription),
      escapeCsvField(stockKeywords),
    ].join(',');

    const csvContent = `${headers}\n${row}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'adobe_stock_metadata.csv';
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
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!metadata) {
    return (
      <div className="flex items-center justify-center h-full rounded-lg border border-dashed p-8 text-center min-h-[400px]">
        <p className="text-muted-foreground">Upload an image to magically generate metadata.</p>
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-xl md:text-2xl">Generated Metadata</CardTitle>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportAsCsv}>
                <Download className="mr-2 h-4 w-4" /> Export for Adobe Stock
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportAs('json')}>
                <Download className="mr-2 h-4 w-4" /> JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportAs('txt')}>
                <Download className="mr-2 h-4 w-4" /> TXT
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <MetadataCard title="AI Generated Caption" content={metadata.caption} />
        <MetadataCard title="Stock Keywords" content={metadata.stockKeywords} />
        <MetadataCard title="Stock Title" content={metadata.stockTitle} />
        <MetadataCard title="Stock Description" content={metadata.stockDescription} />
      </CardContent>
    </Card>
  );
}
