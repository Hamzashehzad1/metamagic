
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
        <section className="text-center py-20 md:py-32 bg-gradient-to-b from-background to-muted/50">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline text-primary tracking-tighter">
              The Best Price You'll Ever See.
            </h1>
            <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
              We believe powerful SEO tools should be accessible to everyone. No hidden fees, no enterprise plans, no nonsense. Just powerful, free tools to help you succeed.
            </p>
          </div>
        </section>

        {/* Pricing Card Section */}
        <section id="pricing" className="py-20 -mt-24">
          <div className="container mx-auto px-4 flex justify-center">
            <Card className="max-w-md w-full shadow-2xl border-primary border-2 transform hover:scale-105 transition-transform duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">Free Forever Plan</CardTitle>
                <CardDescription>Everything you need to dominate your SEO.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="text-center">
                    <span className="text-7xl font-extrabold">$0</span>
                    <span className="text-xl text-muted-foreground">/ month</span>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0"/>
                    <div>
                      <h3 className="font-semibold">AI Metadata Generator</h3>
                      <p className="text-sm text-muted-foreground">For stock photos and search engines.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0"/>
                    <div>
                      <h3 className="font-semibold">WordPress Alt Text Generator</h3>
                      <p className="text-sm text-muted-foreground">Scan and fix your entire media library.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0"/>
                    <div>
                      <h3 className="font-semibold">AI Meta Description Writer</h3>
                      <p className="text-sm text-muted-foreground">Generate descriptions from a URL or text.</p>
                    </div>
                  </li>
                   <li className="flex items-start gap-4">
                    <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0"/>
                    <div>
                      <h3 className="font-semibold">Secure Key & Site Storage</h3>
                      <p className="text-sm text-muted-foreground">Your credentials are encrypted and linked to your account.</p>
                    </div>
                  </li>
                   <li className="flex items-start gap-4">
                    <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0"/>
                    <div>
                      <h3 className="font-semibold">Unlimited Use</h3>
                      <p className="text-sm text-muted-foreground">Your only limit is your Gemini API key quota.</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                 <Button asChild size="lg" className="w-full">
                    <Link href="/signup">Get Started - It's Free! <ChevronRight className="ml-2" /></Link>
                 </Button>
                 <p className="text-xs text-muted-foreground">No credit card required. <Link href="/#features" className='underline'>Learn more</Link>.</p>
              </CardFooter>
            </Card>
          </div>
        </section>

      </main>
      <footer className="py-6 px-4 md:px-6 border-t mt-16">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MetaMagic. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
