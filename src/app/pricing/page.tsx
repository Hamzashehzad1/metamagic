
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing | MetaMagic',
    description: 'Get free, unlimited access to all of MetaMagic\'s AI-powered SEO tools. Your only limit is your own Gemini API key quota.',
    alternates: {
        canonical: '/pricing',
    },
};

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="text-center py-20 md:py-32">
           <div
              className="absolute top-0 left-0 -z-10 h-full w-full bg-background 
              [background:radial-gradient(50%_50%_at_50%_50%,hsl(var(--primary)/0.1),transparent_100%)]"
              aria-hidden="true"
           />
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline text-primary tracking-tighter text-balance">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground text-balance">
              We believe powerful SEO tools should be accessible to everyone. No hidden fees, no enterprise plans, no nonsense. Just powerful, free tools to help you succeed.
            </p>
          </div>
        </section>

        {/* Pricing Card Section */}
        <section id="pricing" className="py-20 -mt-32 md:-mt-40">
          <div className="container mx-auto px-4 flex justify-center">
            <Card className="max-w-md w-full shadow-2xl border-primary/20 border-2 transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-2">
              <CardHeader className="text-center p-8">
                <CardTitle className="text-3xl font-bold">Free Forever Plan</CardTitle>
                <CardDescription className="text-muted-foreground">Everything you need to dominate your SEO.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-8 pt-0">
                <div className="text-center">
                    <span className="text-7xl font-extrabold">$0</span>
                    <span className="text-xl text-muted-foreground">/ month</span>
                    <p className="text-sm text-muted-foreground mt-4 text-balance">MetaMagic is free. You bring your own Google Gemini API key and only pay for what you use at their standard rates. We don't add any extra charges.</p>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0"/>
                    <div>
                      <h3 className="font-semibold">AI Metadata Generator</h3>
                      <p className="text-sm text-muted-foreground">For stock photos and search engines.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0"/>
                    <div>
                      <h3 className="font-semibold">WordPress Alt Text Generator</h3>
                      <p className="text-sm text-muted-foreground">Scan and fix your entire media library.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0"/>
                    <div>
                      <h3 className="font-semibold">AI Meta Description Writer</h3>
                      <p className="text-sm text-muted-foreground">Generate descriptions from a URL or text.</p>
                    </div>
                  </li>
                   <li className="flex items-start gap-4">
                    <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0"/>
                    <div>
                      <h3 className="font-semibold">Secure Key & Site Storage</h3>
                      <p className="text-sm text-muted-foreground">Your credentials are encrypted and private.</p>
                    </div>
                  </li>
                   <li className="flex items-start gap-4">
                    <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0"/>
                    <div>
                      <h3 className="font-semibold">Unlimited Use</h3>
                      <p className="text-sm text-muted-foreground">Your only limit is your Gemini API key quota.</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 p-8">
                 <Button asChild size="lg" className="w-full group">
                    <Link href="/signup">Get Started - It's Free! <ChevronRight className="ml-2 transition-transform group-hover:translate-x-1" /></Link>
                 </Button>
                 <p className="text-xs text-muted-foreground">No credit card required.</p>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
      <footer className="py-8 border-t bg-background">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <p className="text-sm font-semibold">&copy; {new Date().getFullYear()} MetaMagic. All Rights Reserved.</p>
                    <p className="text-sm text-muted-foreground">An AI-powered SEO toolkit by Web Brewery.</p>
                </div>
                <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary hover:underline">Home</Link>
                    <Link href="/#features" className="hover:text-primary hover:underline">Features</Link>
                    <Link href="/pricing" className="hover:text-primary hover:underline">Pricing</Link>
                    <Link href="/dashboard" className="hover:text-primary hover:underline">Dashboard</Link>
                </nav>
            </div>
        </footer>
    </div>
  );
}
