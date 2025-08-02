"use client";

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Download, Wand2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { upscaleImageAction } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

export default function UpscalerPage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Enhancement settings
  const [upscaleFactor, setUpscaleFactor] = useState<'2x' | '4x' | '8x'>('2x');
  const [sharpness, setSharpness] = useState([50]);
  const [noiseReduction, setNoiseReduction] = useState([50]);
  const [colorEnhancement, setColorEnhancement] = useState([50]);
  const [brightness, setBrightness] = useState([50]);


  const handleFileUpload = useCallback((uploadedFile: File) => {
    if (originalUrl) {
      URL.revokeObjectURL(originalUrl);
    }
    setOriginalFile(uploadedFile);
    setOriginalUrl(URL.createObjectURL(uploadedFile));
    setUpscaledUrl(null);
    setError(null);
  }, [originalUrl]);

  const handleUpscale = async () => {
    if (!originalFile) return;

    setIsLoading(true);
    setError(null);
    setUpscaledUrl(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(originalFile);

      reader.onload = async () => {
        try {
          const fileDataUri = reader.result as string;
          const result = await upscaleImageAction({
            photoDataUri: fileDataUri,
            upscaleFactor: upscaleFactor,
            sharpness: sharpness[0],
            noiseReduction: noiseReduction[0],
            colorEnhancement: colorEnhancement[0],
            brightness: brightness[0],
          });
          setUpscaledUrl(result.upscaledImageUrl);
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during upscaling.';
          setError(errorMessage);
          toast({
            variant: 'destructive',
            title: 'Upscaling Error',
            description: errorMessage,
          });
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        throw new Error('Failed to read file.');
      };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!upscaledUrl) return;
    const a = document.createElement('a');
    a.href = upscaledUrl;
    a.download = `upscaled_${originalFile?.name || 'image'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
            Don't Let a Low-Res Image Kill Your Conversion Rate
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            You've spent hours perfecting your content, but a blurry, pixelated image can make your entire page look unprofessional. Our AI upscaler transforms your low-quality photos into high-resolution masterpieces, so you can make a killer first impression, every single time.
          </p>
        </section>
        
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
                <Card className="sticky top-24">
                    <CardHeader>
                        <CardTitle>Enhancement Settings</CardTitle>
                        <CardDescription>Fine-tune the AI to get the perfect result.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label className="font-semibold">Upscale Factor</Label>
                            <p className="text-sm text-muted-foreground mb-2">How much larger do you want your image?</p>
                            <RadioGroup value={upscaleFactor} onValueChange={(value) => setUpscaleFactor(value as '2x'|'4x'|'8x')} className="flex gap-4">
                                <div><RadioGroupItem value="2x" id="2x" /><Label htmlFor="2x" className="ml-2">2x</Label></div>
                                <div><RadioGroupItem value="4x" id="4x" /><Label htmlFor="4x" className="ml-2">4x</Label></div>
                                <div><RadioGroupItem value="8x" id="8x" /><Label htmlFor="8x" className="ml-2">8x</Label></div>
                            </RadioGroup>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="sharpness" className="font-semibold">Sharpness</Label>
                                <Slider id="sharpness" value={sharpness} onValueChange={setSharpness} max={100} step={1} />
                            </div>
                            <div>
                                <Label htmlFor="noiseReduction" className="font-semibold">Noise Reduction</Label>
                                <Slider id="noiseReduction" value={noiseReduction} onValueChange={setNoiseReduction} max={100} step={1} />
                            </div>
                             <div>
                                <Label htmlFor="colorEnhancement" className="font-semibold">Color Enhancement</Label>
                                <Slider id="colorEnhancement" value={colorEnhancement} onValueChange={setColorEnhancement} max={100} step={1} />
                            </div>
                             <div>
                                <Label htmlFor="brightness" className="font-semibold">Brightness</Label>
                                <Slider id="brightness" value={brightness} onValueChange={setBrightness} max={100} step={1} />
                            </div>
                        </div>

                         <Button onClick={handleUpscale} disabled={isLoading || !originalFile} size="lg" className="w-full">
                            <Wand2 className="mr-2" />
                            {isLoading ? 'Enhancing Your Image...' : 'Process Image'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-8">
                 <FileUploader
                    onFileUpload={handleFileUpload}
                    fileUrl={originalUrl}
                    fileType={originalFile?.type || null}
                    isLoading={isLoading && !upscaledUrl}
                    loadingStatus="Uploading..."
                    accept={{ 'image/*': ['.jpeg', '.png', '.webp'] }}
                    dropzoneText="Only image files are supported"
                />

                {error && (
                    <Alert variant="destructive" className="max-w-4xl mx-auto">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-center">Your Enhanced Image</h2>
                        {upscaledUrl && (
                            <Button variant="outline" size="sm" onClick={handleDownload}>
                                <Download className="mr-2 h-4 w-4" /> Download
                            </Button>
                        )}
                    </div>
                    <div className="border rounded-lg p-2 aspect-video flex items-center justify-center bg-muted/20 min-h-[300px]">
                        {isLoading && <Skeleton className="w-full h-full" />}
                        {!isLoading && !upscaledUrl && <p className="text-muted-foreground">Your masterpiece will appear here</p>}
                        {upscaledUrl && (
                            <Image src={upscaledUrl} alt="Upscaled" width={1024} height={1024} className="object-contain max-h-full rounded-md" />
                        )}
                    </div>
                </div>

                {originalUrl && (
                  <div>
                      <h2 className="text-2xl font-bold text-center mb-4">Original Image</h2>
                      <div className="border rounded-lg p-2 aspect-video flex items-center justify-center bg-muted/20">
                          <Image src={originalUrl} alt="Original" width={1024} height={1024} className="object-contain max-h-full rounded-md" />
                      </div>
                  </div>
                )}
            </div>
        </div>
      </main>
      <footer className="py-4 px-4 md:px-6 border-t mt-16">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Powered by MetaMagic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
