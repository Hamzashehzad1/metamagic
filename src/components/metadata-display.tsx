
"use client";

import { useState } from 'react';
import { type ProcessedFile } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { MetadataCard } from './metadata-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';

interface MetadataDisplayProps {
  processedFiles: ProcessedFile[];
  isLoading: boolean;
  onUpdateMetadata: (fileIndex: number, newMetadata: ProcessedFile['metadata']) => void;
}

export function MetadataDisplay({ processedFiles, isLoading, onUpdateMetadata }: MetadataDisplayProps) {

  const exportAllAsCsv = () => {
    if (processedFiles.length === 0) return;

    // Adobe Stock CSV headers: Filename,Title,Description,Keywords
    const headers = 'Filename,Title,Description,Keywords';
    const escapeCsvField = (field: string) => `"${field.replace(/"/g, '""')}"`;

    const rows = processedFiles.map(file => {
      const { name, metadata } = file;
      const { stockTitle, stockDescription, stockKeywords } = metadata;
      return [
        name,
        escapeCsvField(stockTitle),
        escapeCsvField(stockDescription),
        escapeCsvField(stockKeywords),
      ].join(',');
    });
    
    const csvContent = `${headers}\n${rows.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adobe_stock_metadata_batch_${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleMetadataChange = (fileIndex: number, field: keyof ProcessedFile['metadata'], value: string) => {
    const updatedFile = { ...processedFiles[fileIndex] };
    const updatedMetadata = { ...updatedFile.metadata, [field]: value };
    onUpdateMetadata(fileIndex, updatedMetadata);
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Generating Metadata...</CardTitle>
          <CardDescription>Please wait while the AI processes your images.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (processedFiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full rounded-lg border border-dashed p-8 text-center min-h-[400px]">
        <div>
            <p className="text-muted-foreground">Upload one or more images to magically generate metadata.</p>
            <p className="text-sm text-muted-foreground mt-2">Your results will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-xl md:text-2xl">Generated Metadata</CardTitle>
          <CardDescription>Generated for {processedFiles.length} image(s). You can edit the text before exporting.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportAllAsCsv} disabled={processedFiles.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Export All for Adobe Stock
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
            {processedFiles.map((file, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="font-semibold text-left hover:no-underline">
                    <span className="truncate">{file.name}</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                   <Tabs defaultValue="caption">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="caption">Caption</TabsTrigger>
                            <TabsTrigger value="title">Title</TabsTrigger>
                            <TabsTrigger value="description">Description</TabsTrigger>
                            <TabsTrigger value="keywords">Keywords</TabsTrigger>
                        </TabsList>
                        <TabsContent value="caption" className="mt-4">
                            <MetadataCard 
                                title="AI Generated Caption" 
                                content={file.metadata.caption} 
                                onContentChange={(val) => handleMetadataChange(index, 'caption', val)}
                            />
                        </TabsContent>
                        <TabsContent value="title" className="mt-4">
                            <MetadataCard 
                                title="Stock Title" 
                                content={file.metadata.stockTitle} 
                                onContentChange={(val) => handleMetadataChange(index, 'stockTitle', val)}
                            />
                        </TabsContent>
                        <TabsContent value="description" className="mt-4">
                            <MetadataCard 
                                title="Stock Description" 
                                content={file.metadata.stockDescription}
                                onContentChange={(val) => handleMetadataChange(index, 'stockDescription', val)}
                            />
                        </TabsContent>
                        <TabsContent value="keywords" className="mt-4">
                            <div className="space-y-2">
                                <MetadataCard 
                                    title="Stock Keywords" 
                                    content={file.metadata.stockKeywords} 
                                    onContentChange={(val) => handleMetadataChange(index, 'stockKeywords', val)}
                                />
                                <div className="flex flex-wrap gap-2">
                                    {file.metadata.stockKeywords.split(',').map(k => k.trim()).filter(Boolean).map((keyword, i) => (
                                        <Badge key={i} variant="secondary" className="rounded-md">{keyword}</Badge>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                   </Tabs>
                </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
