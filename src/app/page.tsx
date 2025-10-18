
'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { Check, ChevronRight, Image as ImageIcon, FileText, Globe } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || user) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="text-center py-20 md:py-32 bg-gradient-to-b from-background to-muted/50">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline text-primary tracking-tighter">
              Stop Guessing. Start Dominating Your Media SEO.
            </h1>
            <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
              Are you tired of spending hours writing metadata that never seems to rank? MetaMagic is your secret weapon. We use advanced AI to generate perfect, SEO-optimized metadata for your images and content in seconds. It's time to work smarter, not harder.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/signup">Get Started For Free <ChevronRight className="ml-2" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">No credit card required. Unleash your SEO potential now.</p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">The Tools You Need to Win at SEO</h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">Don't just compete. Dominate. These aren't just tools; they're your unfair advantage.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="transform hover:scale-105 transition-transform duration-300">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                      <div className="p-4 bg-primary/10 rounded-full">
                          <ImageIcon className="h-8 w-8 text-primary" />
                      </div>
                  </div>
                  <CardTitle className="text-center text-xl font-bold">AI Metadata Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">Upload your images and watch our AI instantly generate titles, descriptions, and keywords that stock photo sites and search engines love. Stop the manual grind and start selling.</p>
                </CardContent>
              </Card>
              <Card className="transform hover:scale-105 transition-transform duration-300">
                <CardHeader>
                   <div className="flex justify-center mb-4">
                      <div className="p-4 bg-primary/10 rounded-full">
                          <Globe className="h-8 w-8 text-primary" />
                      </div>
                  </div>
                  <CardTitle className="text-center text-xl font-bold">WordPress Alt Text Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">Connect your WordPress site and let our AI scan your entire media library. It fills in missing alt text, boosting your accessibility and image search rankings overnight. It's set-and-forget SEO power.</p>
                </CardContent>
              </Card>
              <Card className="transform hover:scale-105 transition-transform duration-300">
                <CardHeader>
                   <div className="flex justify-center mb-4">
                      <div className="p-4 bg-primary/10 rounded-full">
                          <FileText className="h-8 w-8 text-primary" />
                      </div>
                  </div>
                  <CardTitle className="text-center text-xl font-bold">AI Meta Description Writer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">Feed our AI any URL or text, and get a compelling, click-worthy meta description in seconds. Increase your click-through rate and drive more organic traffic, effortlessly.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* "Why You'll Love It" Section */}
        <section className="py-20 bg-muted/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">Stop Wasting Time. Start Seeing Results.</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                        Here’s the deal: Your competitors are either paying agencies thousands or spending countless hours on SEO. You can beat them with a few clicks.
                    </p>
                </div>
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                    <div className="flex items-start gap-4">
                        <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0"/>
                        <div>
                            <h3 className="font-semibold text-lg">Save Dozens of Hours Every Week</h3>
                            <p className="text-muted-foreground">What would you do with all that extra time? Focus on creating, not on tedious SEO tasks. MetaMagic automates the boring stuff.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0"/>
                        <div>
                            <h3 className="font-semibold text-lg">Rank Higher on Google and Stock Sites</h3>
                            <p className="text-muted-foreground">Our AI is trained on data from top-ranking content. It knows what works. It knows how to make your content visible.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0"/>
                        <div>
                            <h3 className="font-semibold text-lg">Drive More Organic Traffic</h3>
                            <p className="text-muted-foreground">Better titles, descriptions, and alt text directly lead to higher click-through rates and more visitors. It's that simple.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0"/>
                        <div>
                            <h3 className="font-semibold text-lg">Secure and Private</h3>
                            <p className="text-muted-foreground">Your API keys and site connections are encrypted and securely stored, linked only to your account. Your data is yours, period.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        {/* Final CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Ready to Revolutionize Your SEO Workflow?</h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground">
              You're seconds away from taking the guesswork out of metadata. Stop leaving money and traffic on the table.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/signup">Claim Your Free Account Now <ChevronRight className="ml-2" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 px-4 md:px-6 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MetaMagic. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
