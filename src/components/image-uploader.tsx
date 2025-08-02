"use client"

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imageUrl: string | null;
  isLoading: boolean;
  loadingStatus: string;
}

export function ImageUploader({ onImageUpload, imageUrl, isLoading, loadingStatus }: ImageUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageUpload(acceptedFiles[0]);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.webp'],
    },
    multiple: false,
  });

  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full">
        <div
          {...getRootProps()}
          className={cn(
            "relative flex flex-col items-center justify-center w-full h-full min-h-[300px] md:min-h-[400px] border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors",
            isDragActive ? "border-primary bg-primary/10" : "border-border"
          )}
        >
          <input {...getInputProps()} />

          {isLoading && (
            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10 rounded-lg">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 text-center font-medium">{loadingStatus}</p>
            </div>
          )}
          
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Image preview"
              layout="fill"
              objectFit="contain"
              className="rounded-lg p-2"
              data-ai-hint="uploaded image"
            />
          ) : (
            <div className="text-center p-4">
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 font-semibold">Drag & drop an image here</p>
              <p className="text-sm text-muted-foreground">or click to select a file</p>
              <p className="text-xs text-muted-foreground mt-2">PNG, JPG, GIF, WEBP supported</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
