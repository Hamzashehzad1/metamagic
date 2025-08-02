"use client"

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  fileUrl: string | null;
  fileType: string | null;
  isLoading: boolean;
  loadingStatus: string;
  accept?: Record<string, string[]>;
  dropzoneText?: string;
}

export function FileUploader({ 
    onFileUpload, 
    fileUrl, 
    fileType, 
    isLoading, 
    loadingStatus, 
    accept = {
        'image/*': ['.jpeg', '.png', '.gif', '.webp', '.svg+xml'],
        'video/*': ['.mp4', '.webm'],
    },
    dropzoneText = "Images, Videos, and SVGs supported"
}: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
  });

  const renderPreview = () => {
    if (!fileUrl || !fileType) return null;

    if (fileType.startsWith('image/')) {
        return (
            <Image
              src={fileUrl}
              alt="File preview"
              fill
              className="rounded-lg object-contain p-2"
              data-ai-hint="uploaded image"
            />
        )
    }

    if (fileType.startsWith('video/')) {
        return (
            <video
                src={fileUrl}
                controls
                className="w-full h-full object-contain rounded-lg p-2"
                data-ai-hint="uploaded video"
            >
                Your browser does not support the video tag.
            </video>
        )
    }

    return <p>Unsupported file type</p>;
  }

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
          
          {fileUrl ? (
            renderPreview()
          ) : (
            <div className="text-center p-4">
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 font-semibold">Drag & drop a file here</p>
              <p className="text-sm text-muted-foreground">or click to select a file</p>
              <p className="text-xs text-muted-foreground mt-2">{dropzoneText}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
