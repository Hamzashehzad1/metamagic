
"use client"

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, FileImage, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface FileUploaderProps {
  onFileUpload: (files: File[]) => void;
  files: File[];
  isLoading: boolean;
  loadingStatus: string;
  accept?: Record<string, string[]>;
  dropzoneText?: string;
  disabled?: boolean;
}

export function FileUploader({ 
    onFileUpload, 
    files, 
    isLoading, 
    loadingStatus, 
    accept = {
        'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg+xml'],
    },
    dropzoneText = "Images supported (JPG, PNG, GIF, WEBP)",
    disabled = false
}: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: true,
    disabled,
  });

  const renderFilePreviews = () => {
    if (files.length === 0) return null;

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
        {files.map((file, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
             <Image
                src={URL.createObjectURL(file)}
                alt={`Preview of ${file.name}`}
                fill
                className="object-cover"
                onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                data-ai-hint="uploaded image"
             />
             <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1 text-white text-xs truncate">
                {file.name}
             </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className={cn(disabled && "bg-muted/50")}>
      <CardContent className="p-4 h-full">
        <div
          {...getRootProps()}
          className={cn(
            "relative flex flex-col items-center justify-center w-full h-full min-h-[150px] border-2 border-dashed rounded-lg transition-colors",
            isDragActive ? "border-primary bg-primary/10" : "border-border",
            disabled ? "cursor-not-allowed border-muted-foreground/50" : "cursor-pointer hover:border-primary"
          )}
        >
          <input {...getInputProps()} />

          {isLoading && (
            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10 rounded-lg">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 text-center font-medium">{loadingStatus}</p>
            </div>
          )}
          
          {(files.length > 0 && !isLoading) ? (
            <div className="text-center p-4 text-primary">
                <p className="font-semibold">{files.length} file(s) selected.</p>
                <p className="text-sm">Click or drag to add more, or clear selection.</p>
            </div>
          ) : (
            !isLoading && <div className="text-center p-4">
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              {disabled ? (
                <>
                    <p className="mt-4 font-semibold">Uploader Disabled</p>
                    <p className="text-sm text-muted-foreground">Please enter your API key to enable file uploads.</p>
                </>
              ) : (
                <>
                    <p className="mt-4 font-semibold">Drag & drop files here</p>
                    <p className="text-sm text-muted-foreground">or click to select files</p>
                    <p className="text-xs text-muted-foreground mt-2">{dropzoneText}</p>
                </>
              )}
            </div>
          )}
        </div>
        {files.length > 0 && !isLoading && (
            <div className="mt-4">
                <h4 className="font-semibold mb-2">Selected Files:</h4>
                {renderFilePreviews()}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
