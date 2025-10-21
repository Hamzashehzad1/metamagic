
'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ChevronRight, Image as ImageIcon, FileText, Globe, Zap } from 'lucide-react';
import Link from 'next/link';
import { faqData, testimonials } from './landing-page-data';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


export default function LandingPage() {
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative text-center py-24 md:py-32 lg:py-40 overflow-hidden">
             <div
                className="absolute top-0 left-0 -z-10 h-full w-full bg-background 
                [background:radial-gradient(50%_50%_at_50%_50%,hsl(var(--primary)/0.1),transparent_100%)]"
                aria-hidden="true"
             />
            <div className="container mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-extrabold font-headline text-primary tracking-tighter text-balance">
                  Writing Alt Text is Tedious. Let's Automate It.
                </h1>
                <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground text-balance">
                  Are you tired of the repetitive task of writing alt descriptions for every image? MetaMagic is your secret weapon. We use advanced AI to instantly generate high-quality, SEO-friendly metadata, turning hours of work into seconds. It's time to reclaim your time and improve your search rankings.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" className="group">
                    <Link href="/signup">
                        Get Started For Free 
                        <ChevronRight className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                    <Link href="/#features">See How It Works</Link>
                </Button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">No credit card required. Start automating your SEO now.</p>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">Our Core Features</p>
                <h2 className="mt-2 text-3xl md:text-4xl font-bold font-headline">Your New Favorite SEO Toolkit</h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-balance">These aren't just tools; they're your unfair advantage. Here’s how we make your life easier and your content more visible.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative">
                  <div className="flex justify-center mb-4">
                      <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                          <ImageIcon className="h-8 w-8 text-primary" />
                      </div>
                  </div>
                  <CardTitle className="text-center text-xl font-bold">AI Metadata Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground text-balance">Perfect for photographers and e-commerce. Upload your images, and our AI becomes your personal alt text writer, instantly generating titles, descriptions, and keywords that help you rank on Google and sell on stock sites.</p>
                </CardContent>
              </Card>
              <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative">
                   <div className="flex justify-center mb-4">
                      <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                          <Globe className="h-8 w-8 text-primary" />
                      </div>
                  </div>
                  <CardTitle className="text-center text-xl font-bold">WordPress Alt Text Auditor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground text-balance">Is your media library an SEO graveyard of missing alt attributes? Connect your WordPress site, and our tool will scan your entire library. We make adding alt text to images a one-click job, boosting your site's accessibility and image search rankings overnight.</p>
                </CardContent>
              </Card>
              <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative">
                   <div className="flex justify-center mb-4">
                      <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                          <FileText className="h-8 w-8 text-primary" />
                      </div>
                  </div>
                  <CardTitle className="text-center text-xl font-bold">AI Meta Description Writer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground text-balance">A great meta description can dramatically increase your click-through rate. Give our AI any URL or block of text, and get a compelling, click-worthy summary in seconds. Drive more organic traffic, effortlessly.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* "Why You'll Love It" Section */}
        <section className="py-20 md:py-28 bg-muted/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                     <p className="text-sm font-semibold uppercase tracking-wider text-primary">The Advantage</p>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold font-headline">Here’s Why You’ll Love MetaMagic</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-balance">
                        Your competitors are either paying thousands for SEO or spending countless hours on manual work. You're about to leapfrog them with a few clicks.
                    </p>
                </div>
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full"><Check className="h-6 w-6 text-green-500 flex-shrink-0"/></div>
                        <div>
                            <h3 className="font-semibold text-lg">Save Dozens of Hours Every Week</h3>
                            <p className="text-muted-foreground mt-1">What would you do with all that extra time? The endless task of writing alt text is over. Focus on creating, not on tedious SEO chores. MetaMagic automates the boring stuff so you can get back to what you do best.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full"><Check className="h-6 w-6 text-green-500 flex-shrink-0"/></div>
                        <div>
                            <h3 className="font-semibold text-lg">Finally Understand Alt Tags and SEO</h3>
                            <p className="text-muted-foreground mt-1">Our AI is trained on top-ranking content and alt text best practices. It understands the meaning of an alt tag and generates descriptions that are perfect for both search engines and screen readers, improving your image accessibility and SEO.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full"><Check className="h-6 w-6 text-green-500 flex-shrink-0"/></div>
                        <div>
                            <h3 className="font-semibold text-lg">Drive More Organic Traffic</h3>
                            <p className="text-muted-foreground mt-1">Good alt tags for images are a cornerstone of image SEO. By ensuring every `img alt` attribute is filled with a meaningful, keyword-rich description, you open the floodgates to more visitors from Google Images.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full"><Check className="h-6 w-6 text-green-500 flex-shrink-0"/></div>
                        <div>
                            <h3 className="font-semibold text-lg">Secure and Private by Design</h3>
                            <p className="text-muted-foreground mt-1">Your API keys and site connections are encrypted and stored securely in your own private data space, linked only to your account. Your data is yours, period.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">Don't Just Take Our Word For It</p>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold font-headline">What Our Users Say</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-balance">
                        Real stories from people who've transformed their workflow and boosted their SEO with MetaMagic.
                    </p>
                </div>
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto"
                >
                  <CarouselContent>
                    {testimonials.map((testimonial, index) => (
                      <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1 h-full">
                           <Card className="h-full flex flex-col bg-muted/50 border-border">
                              <CardContent className="p-6 flex-1 flex flex-col justify-between">
                                  <p className="text-foreground/80 mb-6 text-balance">"{testimonial.quote}"</p>
                                  <div>
                                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                                    <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                                  </div>
                              </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden lg:flex" />
                  <CarouselNext className="hidden lg:flex" />
                </Carousel>
            </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 md:py-28 bg-muted/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Still Have Questions?</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold font-headline">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg text-left text-balance">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground text-balance">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <Zap className="h-12 w-12 text-primary mx-auto" />
            <h2 className="mt-4 text-3xl md:text-4xl font-bold font-headline text-balance">Ready to Revolutionize Your SEO Workflow?</h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground text-balance">
              You're seconds away from taking the guesswork out of your metadata. Stop leaving traffic and money on the table. The perfect alternative text for your images is just a click away.
            </p>
            <div className="mt-10">
              <Button asChild size="lg" className="group">
                <Link href="/signup">Claim Your Free Account Now <ChevronRight className="ml-2 transition-transform group-hover:translate-x-1" /></Link>
              </Button>
            </div>
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

    