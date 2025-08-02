
'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Wand2, Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { processImageUpscaling } from '@/app/actions';

export default function UpscalerPage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalFileUrl, setOriginalFileUrl] = useState<string | null>(null);
  const [upscaledImageUrl, setUpscaledImageUrl] = useState<string | null>(null);
  
  const [upscaleFactor, setUpscaleFactor] = useState(2);
  const [sharpness, setSharpness] = useState(0);
  const [noiseReduction, setNoiseReduction] = useState(0);
  const [colorEnhancement, setColorEnhancement] = useState(0);
  const [brightness, setBrightness] = useState(0);

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

  const handleProcessing = async (autoEnhance = false) => {
    if (!originalFile) {
        toast({
            variant: 'destructive',
            title: 'No Image Uploaded',
            description: 'Please upload an image before processing.',
        });
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
        const reader = new FileReader();
        reader.readAsDataURL(originalFile);
        reader.onload = async () => {
            try {
                const fileDataUri = reader.result as string;
                const resultUrl = await processImageUpscaling({
                    photoDataUri: fileDataUri,
                    upscaleFactor,
                    sharpness,
                    noiseReduction,
                    colorEnhancement,
                    brightness,
                    autoEnhance,
                });
                setUpscaledImageUrl(resultUrl);
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
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
            throw new Error('Failed to read the uploaded file.');
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

  const downloadImage = () => {
    if (upscaledImageUrl) {
      const a = document.createElement('a');
      a.href = upscalededImageUrl;
      a.download = 'upscaled-image.png';
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
                Transform Your Images with 1-Click AI Upscaling
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                Stop using blurry, low-resolution images. Our AI instantly upscales your photos to 2x, 4x, or even 8x their original size, revealing stunning detail you never knew existed. It's time to make your visuals pop.
            </p>
        </section>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2 self-start sticky top-24 z-10">
                <FileUploader 
                    onFileUpload={handleFileUpload}
                    fileUrl={originalFileUrl}
                    fileType={originalFile ? originalFile.type : null}
                    isLoading={false} // We handle loading state separately on this page
                    loadingStatus=""
                    accept={{'image/*': ['.jpeg', '.png', '.gif', '.webp']}}
                    dropzoneText="Only images are supported for upscaling"
                />
            </div>

            <div className="lg:col-span-3 space-y-8">
                <Card className="shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Sparkles className="text-primary" /> AI Upscaled Image
                        </CardTitle>
                        <CardDescription>
                            Your enhanced image will appear here. Use the controls below to refine the result.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full aspect-video rounded-lg border border-dashed flex items-center justify-center bg-muted/40">
                            {isLoading ? (
                                <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10 rounded-lg">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                    <p className="mt-4 text-center font-medium">Enhancing your image...</p>
                                </div>
                            ) : upscaledImageUrl ? (
                                <Image src={upscaledImageUrl} alt="Upscaled Image" fill className="object-contain rounded-lg p-2" />
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <ImageIcon className="mx-auto h-12 w-12" />
                                    <p>Upload an image and apply enhancements</p>
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

                <Card>
                    <CardHeader>
                        <CardTitle>Enhancement Controls</CardTitle>
                        <CardDescription>
                           Use the AI to automatically enhance your image or fine-tune the settings yourself.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="space-y-4">
                            <Label className="text-base font-medium">Upscale Factor</Label>
                            <RadioGroup value={String(upscaleFactor)} onValueChange={(v) => setUpscaleFactor(Number(v))} className="flex space-x-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="2" id="r1" />
                                    <Label htmlFor="r1">2x</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="4" id="r2" />
                                    <Label htmlFor="r2">4x</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="8" id="r3" />
                                    <Label htmlFor="r3">8x</Label>
                                </div>
                            </RadioGroup>
                         </div>
                        
                        <div className="space-y-4">
                            <Label htmlFor="sharpness" className="flex justify-between"><span>Sharpness</span><span>{sharpness}%</span></Label>
                            <Slider id="sharpness" value={[sharpness]} onValueChange={([v]) => setSharpness(v)} max={100} step={1} />
                        </div>
                         <div className="space-y-4">
                            <Label htmlFor="noiseReduction" className="flex justify-between"><span>Noise Reduction</span><span>{noiseReduction}%</span></Label>
                            <Slider id="noiseReduction" value={[noiseReduction]} onValueChange={([v]) => setNoiseReduction(v)} max={100} step={1} />
                        </div>
                         <div className="space-y-4">
                            <Label htmlFor="colorEnhancement" className="flex justify-between"><span>Color Enhancement</span><span>{colorEnhancement}%</span></Label>
                            <Slider id="colorEnhancement" value={[colorEnhancement]} onValueChange={([v]) => setColorEnhancement(v)} max={100} step={1} />
                        </div>
                         <div className="space-y-4">
                            <Label htmlFor="brightness" className="flex justify-between"><span>Brightness</span><span>{brightness}%</span></Label>
                            <Slider id="brightness" value={[brightness]} onValueChange={([v]) => setBrightness(v)} max={100} step={1} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                             <Button variant="outline" onClick={() => handleProcessing(true)} disabled={isLoading || !originalFile}>
                                <Sparkles className="mr-2" />
                                Auto Enhance
                            </Button>
                            <Button onClick={() => handleProcessing(false)} disabled={isLoading || !originalFile}>
                                <Wand2 className="mr-2" />
                                Apply Enhancements
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
