
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/header';
import { FileUploader } from '@/components/file-uploader';
import { MetadataDisplay } from '@/components/metadata-display';
import { type Metadata, processFile } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback((uploadedFile: File) => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    setFile(uploadedFile);
    setFileUrl(URL.createObjectURL(uploadedFile));
    setFileType(uploadedFile.type);
    setMetadata(null);
    setError(null);
  }, [fileUrl]);

  useEffect(() => {
    if (!file) return;

    const process = async () => {
      setIsLoading(true);
      
      try {
        setLoadingStatus('Converting file...');
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = async () => {
          try {
            const fileDataUri = reader.result as string;

            setLoadingStatus('Generating caption & SEO data...');
            const result = await processFile(fileDataUri);
            
            setMetadata(result);
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during processing.';
            setError(errorMessage);
            toast({
              variant: 'destructive',
              title: 'Processing Error',
              description: errorMessage,
            });
          } finally {
            setIsLoading(false);
            setLoadingStatus('');
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
        setLoadingStatus('');
      }
    };

    process();

  }, [file, toast]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
                Unlock Free Traffic with AI-Powered Media SEO
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                Stop ignoring your images, videos, and SVGs. Our AI instantly generates SEO-optimized captions, titles, and descriptions to help you rank higher and attract more customers.
            </p>
        </section>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 mb-16">
          <div className="lg:col-span-2 self-start sticky top-24 z-10">
            <FileUploader 
              onFileUpload={handleFileUpload}
              fileUrl={fileUrl}
              fileType={fileType}
              isLoading={isLoading}
              loadingStatus={loadingStatus}
            />
          </div>
          <div className="lg:col-span-3">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <MetadataDisplay metadata={metadata} isLoading={isLoading} />
          </div>
        </div>

        <section className="max-w-4xl mx-auto space-y-16">
            <div>
                <h2 className="text-3xl font-bold text-center mb-8 font-headline">Why Your Media SEO Sucks (And How to Fix It in 60 Seconds)</h2>
                <p className="text-lg text-muted-foreground mb-6">
                    Let's be honest. You upload images, videos, and SVGs to your site, give them a random file name, and hope for the best.
                    <br/><br/>
                    But what if I told you that you're sitting on a goldmine of untapped traffic? Google is one of the world's largest search engines. Every un-optimized media file is a missed opportunity.
                    <br/><br/>
                    The problem? Manually writing alt text, titles, and descriptions is tedious. Who has the time for that?
                    <br/><br/>
                    That's where we come in. MetaMagic analyzes your media content and instantly generates all the metadata you need to dominate search results. It's the ultimate SEO hack for busy marketers and business owners.
                </p>
            </div>
            
            <Card className="shadow-xl border-primary/20 border">
              <CardHeader>
                <CardTitle className="text-center text-3xl font-bold font-headline">The 3-Step "Lazy" Way to Perfect Media SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                  <p className="text-lg"><strong>Step 1:</strong> Drag and drop your image, video, or SVG into the tool above.</p>
                  <p className="text-lg"><strong>Step 2:</strong> Watch as our AI instantly generates your SEO metadata.</p>
                  <p className="text-lg"><strong>Step 3:</strong> Copy, paste, and watch your rankings climb.</p>
              </CardContent>
            </Card>

            <div>
                <h2 className="text-3xl font-bold text-center mb-8 font-headline">Everything You Get with MetaMagic</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-card rounded-lg border">
                        <CheckCircle className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-xl font-bold mb-2">AI-Generated Captions</h3>
                        <p className="text-muted-foreground">Get compelling, context-aware captions that engage your audience and improve accessibility.</p>
                    </div>
                    <div className="p-6 bg-card rounded-lg border">
                        <CheckCircle className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-xl font-bold mb-2">SEO-Optimized Titles</h3>
                        <p className="text-muted-foreground">Generate keyword-rich titles designed to rank in search and drive clicks.</p>
                    </div>
                    <div className="p-6 bg-card rounded-lg border">
                        <CheckCircle className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-xl font-bold mb-2">Persuasive Meta Descriptions</h3>
                        <p className="text-muted-foreground">Create powerful meta descriptions that entice users to click through from search results.</p>
                    </div>
                    <div className="p-6 bg-card rounded-lg border">
                        <CheckCircle className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-xl font-bold mb-2">Relevant SEO Keywords</h3>
                        <p className="text-muted-foreground">Discover the exact keywords and LSI terms Google wants to see associated with your media.</p>
                    </div>
                </div>
            </div>

            <div>
                 <h2 className="text-3xl font-bold text-center mb-8 font-headline">Your Burning Questions, Answered</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-semibold">Is this really free?</AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">
                      Yes, 100%. MetaMagic is a free tool designed to help you improve your SEO. No hidden fees, no credit card required. Just pure value.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-lg font-semibold">How does the AI work?</AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">
                      We use a state-of-the-art multimodal AI model (Google's Gemini) that can understand the content and context of images, videos and SVGs. It then uses this understanding to generate human-like text optimized for search engines.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-lg font-semibold">What kind of files work best?</AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">
                      Our tool works with all common image types (PNG, JPG, WEBP), video formats (MP4, WEBM), and SVGs. For best results, use clear, high-quality files that have a distinct subject. The AI is smart, but it's not a mind reader!
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-4">
                    <AccordionTrigger className="text-lg font-semibold">Why is media SEO so important?</AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">
                     Because it's a massive, untapped traffic source! People use Google to find products, ideas, and information. By optimizing your media, you're making your content visible to millions of potential customers who are actively searching for what you offer. It also improves accessibility and overall on-page SEO.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
            </div>
            
             <div className="text-center pt-8">
                <h2 className="text-3xl font-bold font-headline mb-4">Ready to Stop Ignoring Your Easiest SEO Wins?</h2>
                <p className="text-xl text-muted-foreground mb-6">Upload a file now and see the magic for yourself.</p>
                <p className="text-sm text-muted-foreground">It takes less than a minute. The traffic is waiting.</p>
            </div>

        </section>
      </main>
      <footer className="py-4 px-4 md:px-6 border-t mt-16">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Powered by MetaMagic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
