
'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import Upscaler from 'upscaler';
// @ts-ignore
import upscalerModel from '@upscalerjs/esrgan-slim/4x';


type UpscaleFactor = 2 | 4;

export default function UpscalerPage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalFileUrl, setOriginalFileUrl] = useState<string | null>(null);
  const [upscaledImageUrl, setUpscaledImageUrl] = useState<string | null>(null);
  
  const [upscaleFactor, setUpscaleFactor] = useState<UpscaleFactor>(4);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback((uploadedFile: File) => {
    if (originalFileUrl) {
      URL.revokeObjectURL(originalFileUrl);
    }
    if (upscaledImageUrl) {
        URL.revokeObjectURL(upscaledImageUrl);
    }
    setOriginalFile(uploadedFile);
    setOriginalFileUrl(URL.createObjectURL(uploadedFile));
    setUpscaledImageUrl(null);
    setError(null);
  }, [originalFileUrl, upscaledImageUrl]);

  const handleProcessing = async () => {
    if (!originalFileUrl) {
        toast({
            variant: 'destructive',
            title: 'No Image Uploaded',
            description: 'Please upload an image before processing.',
        });
        return;
    }

    setIsLoading(true);
    setError(null);
    setUpscaledImageUrl(null);

    try {
        const upscaler = new Upscaler({
            model: upscalerModel
        });
        const resultUrl = await upscaler.upscale(originalFileUrl, {
            patchSize: 64,
            padding: 4,
        });
        setUpscaledImageUrl(resultUrl);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during upscaling.';
        console.error("Upscaler Error:", e);
        setError(errorMessage);
        toast({
            variant: 'destructive',
            title: 'Upscaling Error',
            description: "Failed to upscale image. Please try a different image.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (upscaledImageUrl) {
      const a = document.createElement('a');
      a.href = upscaledImageUrl;
      a.download = `upscaled-${upscaleFactor}x-image.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
                Transform Your Images with Free AI Upscaling
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                Stop using blurry, low-resolution images. Our free tool instantly upscales your photos to 2x or 4x their original size, revealing stunning detail.
            </p>
        </section>

        <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
                 <FileUploader 
                    onFileUpload={handleFileUpload}
                    fileUrl={originalFileUrl}
                    fileType={originalFile ? originalFile.type : null}
                    isLoading={isLoading}
                    loadingStatus="Upscaling in browser..."
                    accept={{'image/*': ['.jpeg', '.png', '.gif', '.webp']}}
                    dropzoneText="Only images are supported for upscaling"
                />
                 <Card>
                    <CardHeader>
                        <CardTitle>Upscale Settings</CardTitle>
                        <CardDescription>
                           Choose how much larger you want to make your image. The current model supports 4x.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="space-y-4">
                            <Label className="text-base font-medium">Upscale Factor</Label>
                            <RadioGroup value={String(upscaleFactor)} onValueChange={(v) => setUpscaleFactor(Number(v) as UpscaleFactor)} className="flex space-x-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="4" id="r4" />
                                    <Label htmlFor="r4">4x</Label>
                                </div>
                            </RadioGroup>
                         </div>
                        
                        <Button onClick={handleProcessing} disabled={isLoading || !originalFile} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                            {isLoading ? `Upscaling...` : 'Upscale Image'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-8">
                <Card className="shadow-lg h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           Upscaled Image
                        </CardTitle>
                        <CardDescription>
                            Your enhanced image will appear here after processing.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full aspect-video rounded-lg border border-dashed flex items-center justify-center bg-muted/40">
                            {isLoading && (
                                <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10 rounded-lg">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                    <p className="mt-4 text-center font-medium">Upscaling in browser</p>
                                    <p className="text-sm text-muted-foreground">This may take a moment...</p>
                                </div>
                            )}
                            {upscaledImageUrl && !isLoading ? (
                                <Image src={upscaledImageUrl} alt="Upscaled Image" fill className="object-contain rounded-lg p-2" />
                            ) : (
                                <div className="text-center text-muted-foreground p-4">
                                    <ImageIcon className="mx-auto h-12 w-12" />
                                    <p className="mt-2">Upload an image and click "Upscale Image" to see the magic.</p>
                                </div>
                            )}
                        </div>
                        {upscaledImageUrl && !isLoading && (
                             <Button onClick={downloadImage} className="w-full mt-4">
                                <Download className="mr-2"/>
                                Download Upscaled Image
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
