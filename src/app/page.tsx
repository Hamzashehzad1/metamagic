
'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ChevronRight, Image as ImageIcon, FileText, Globe, Zap, Users, BrainCircuit, BarChart, Settings, BookOpen, Layers, GitBranch, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { faqData, testimonials } from './landing-page-data';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';


export default function LandingPage() {
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="relative text-center py-24 md:py-32 lg:py-40 overflow-hidden">
             <div
                className="absolute top-0 left-0 -z-10 h-full w-full bg-background 
                [background:radial-gradient(50%_50%_at_50%_50%,hsl(var(--primary)/0.1),transparent_100%)]"
                aria-hidden="true"
             />
            <div className="container mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-extrabold font-headline text-primary tracking-tighter text-balance">
                  Done with Tedious Alt Text? Automate It.
                </h1>
                <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground text-balance">
                  Tired of the soul-crushing, repetitive task of writing alt text for images? It's time to stop. MetaMagic is your secret weapon for turning hours of manual work into seconds. Our AI doesn't just fill in a blank `img alt` tag—it crafts a meaningful **alt description** that boosts your **alt text SEO** and improves **image accessibility**. Reclaim your time. Rank higher. It's that simple.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" className="group">
                    <Link href="/signup">
                        Get Started For Free 
                        <ChevronRight className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                    <Link href="#how-it-works">See How It Works</Link>
                </Button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">No credit card required. Start automating your image SEO now.</p>
            </div>
        </section>

        {/* 2. Core Features Section */}
        <section id="features" className="py-20 md:py-28 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">Your New Toolkit</p>
                <h2 className="mt-2 text-3xl md:text-4xl font-bold font-headline">Meet Your Unfair Advantage in SEO</h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-balance">These aren't just features; they're your shortcuts to better rankings and more free time. Here’s how we make it happen.</p>
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
                  <p className="text-center text-muted-foreground text-balance">Perfect for photographers and e-commerce stores. Upload your images, and our AI becomes your personal **alt text writer**. It instantly generates a **picture alt text**, titles, and keywords that help you rank on Google and sell on stock sites. It's the ultimate tool for **writing alt text** at scale.</p>
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
                  <p className="text-center text-muted-foreground text-balance">Is your media library an SEO graveyard of missing **alt tags**? Connect your WordPress site, and our tool scans everything. We make **adding alt text to images** a one-click job, fixing your site’s **alt tags for images** and boosting your **image alt text SEO** overnight.</p>
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
                  <p className="text-center text-muted-foreground text-balance">A great meta description can dramatically increase your click-through rate. Give our AI any URL or block of text, and get a compelling, click-worthy summary in seconds. It's like having a professional copywriter on-call, ready to drive more organic traffic, effortlessly.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 6. How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-28">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">It's This Easy</p>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold font-headline">From Zero to Optimized in 3 Steps</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">We designed MetaMagic to be incredibly simple. You're just a few clicks away from perfect metadata.</p>
                </div>
                <div className="relative max-w-4xl mx-auto">
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-[calc(100%-4rem)] bg-border -z-10" aria-hidden="true"></div>
                    <div className="space-y-16">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-headline text-2xl text-primary font-bold">1</div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-semibold">Upload or Connect</h3>
                                <p className="text-muted-foreground mt-2">Drag and drop your images directly into our uploader, paste an image URL, or securely connect your WordPress site in seconds. No complex setup, just get your content in.</p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                             <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-headline text-2xl text-primary font-bold">2</div>
                            <div className="flex-1 text-center md:text-right">
                                <h3 className="text-2xl font-semibold">Click "Generate"</h3>
                                <p className="text-muted-foreground mt-2">This is the magic button. Our **AI alt text** engine analyzes your content and instantly writes everything you need: a descriptive **alt attribute**, SEO titles, and commercially-valuable keywords.</p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                             <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-headline text-2xl text-primary font-bold">3</div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-semibold">Export or Sync</h3>
                                <p className="text-muted-foreground mt-2">Happy with the results? Edit them if you like, then export everything as a ready-to-upload CSV for stock sites, or sync the new metadata directly back to your WordPress media library. Done.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* 10. Comparison Section */}
        <section className="py-20 md:py-28 bg-muted/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">The Old Way vs. The MetaMagic Way</p>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold font-headline">Your Workflow, Reimagined</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">Stop the tedious manual process. This is how much time and effort you save.</p>
                </div>
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-destructive">The Manual Workflow</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3"><span className="text-destructive mt-1">&#10007;</span><div><strong>Stare at an image.</strong> Think about what to write.</div></li>
                                <li className="flex items-start gap-3"><span className="text-destructive mt-1">&#10007;</span><div><strong>Write a mediocre alt tag.</strong> Is it good for SEO? Who knows.</div></li>
                                <li className="flex items-start gap-3"><span className="text-destructive mt-1">&#10007;</span><div><strong>Brainstorm keywords.</strong> Guess what people might search for.</div></li>
                                <li className="flex items-start gap-3"><span className="text-destructive mt-1">&#10007;</span><div><strong>Write a title and description.</strong> Hope it's compelling.</div></li>
                                <li className="flex items-start gap-3"><span className="text-destructive mt-1">&#10007;</span><div><strong>Repeat 49 more times.</strong> Lose your will to live.</div></li>
                                <li className="flex items-start gap-3 font-bold mt-4"><span className="text-destructive mt-1">&#10007;</span><div>Result: Hours wasted, inconsistent quality.</div></li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card className="border-primary/50 border-2">
                        <CardHeader>
                            <CardTitle className="text-primary">The MetaMagic Workflow</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3"><span className="text-green-500 mt-1">&#10003;</span><div><strong>Upload 50 images.</strong> Go grab a coffee.</div></li>
                                <li className="flex items-start gap-3"><span className="text-green-500 mt-1">&#10003;</span><div><strong>Click one button.</strong> Seriously, just one.</div></li>
                                <li className="flex items-start gap-3"><span className="text-green-500 mt-1">&#10003;</span><div><strong>Review perfect metadata.</strong> Our AI handles the **alt attribute for images**, titles, and keywords.</div></li>
                                <li className="flex items-start gap-3"><span className="text-green-500 mt-1">&#10003;</span><div><strong>Export or Sync.</strong> All 50 images are done and optimized.</div></li>
                                <li className="flex items-start gap-3 font-bold mt-4"><span className="text-green-500 mt-1">&#10003;</span><div>Result: Minutes spent, expert-level optimization.</div></li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>


        {/* 7. Why Alt Text Matters Section */}
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">SEO 101</p>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold font-headline">Why Does Google Care So Much About Alt Text?</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-muted-foreground">It’s not just busy work. That small piece of **alt text HTML** is one of the most powerful and overlooked tools for SEO and accessibility. Let's break down the **alt tag meaning**.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
                        <BarChart className="h-10 w-10 text-primary mb-4" />
                        <h3 className="text-xl font-semibold">It's a Ranking Signal</h3>
                        <p className="text-muted-foreground mt-2">A good **alt description** gives search engines like Google critical context about your image. This helps them understand what your page is about, improving your chances to rank not just in Google Images, but in regular search results too. Strong **alt tags and SEO** go hand-in-hand.</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
                        <Users className="h-10 w-10 text-primary mb-4" />
                        <h3 className="text-xl font-semibold">It's About Accessibility</h3>
                        <p className="text-muted-foreground mt-2">For visually impaired users who rely on screen readers, the **alternative text** is their only way to "see" your images. A descriptive **alt text image HTML** tag ensures everyone has access to your content, which is not only the right thing to do, it's also a factor in modern SEO.</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
                        <ImageIcon className="h-10 w-10 text-primary mb-4" />
                        <h3 className="text-xl font-semibold">It's Your Broken Image Backup</h3>
                        <p className="text-muted-foreground mt-2">Ever seen a broken image icon on a webpage? If an image fails to load, the browser displays the **alternate tags** instead. A well-written **alternative text for images** ensures the user still understands what was supposed to be there, maintaining the context of your page.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* 3. "Why You'll Love It" Section */}
        <section className="py-20 md:py-28 bg-muted/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                     <p className="text-sm font-semibold uppercase tracking-wider text-primary">The MetaMagic Advantage</p>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold font-headline">Leapfrog Your Competitors</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-balance">
                        Your competition is either paying a fortune for SEO agencies or drowning in manual tasks. You're about to do it better, faster, and smarter.
                    </p>
                </div>
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full"><Check className="h-6 w-6 text-green-500 flex-shrink-0"/></div>
                        <div>
                            <h3 className="font-semibold text-lg">Save Dozens of Hours Every Week</h3>
                            <p className="text-muted-foreground mt-1">What would you do with all that extra time? The endless chore of **adding alt tags to images** is over. Focus on your actual work, not tedious SEO chores that our AI can do in seconds.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full"><Check className="h-6 w-6 text-green-500 flex-shrink-0"/></div>
                        <div>
                            <h3 className="font-semibold text-lg">Finally Master Alt Text and SEO</h3>
                            <p className="text-muted-foreground mt-1">Our AI is trained on top-ranking content and follows **alt text best practices**. It understands that a great **Google alt** attribute is descriptive and useful, improving both **alt text and SEO** performance and accessibility.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full"><Check className="h-6 w-6 text-green-500 flex-shrink-0"/></div>
                        <div>
                            <h3 className="font-semibold text-lg">Drive More Organic Traffic</h3>
                            <p className="text-muted-foreground mt-1">Proper **alt tags SEO** is a cornerstone of modern digital marketing. By ensuring every **image alt attributes SEO** is filled with a meaningful, keyword-rich description, you open the floodgates to more visitors from Google Images.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full"><Check className="h-6 w-6 text-green-500 flex-shrink-0"/></div>
                        <div>
                            <h3 className="font-semibold text-lg">Secure and Private by Design</h3>
                            <p className="text-muted-foreground mt-1">Your API keys and site connections are encrypted and stored securely in your own private data space, linked only to your account. Your data is yours, period. The **alt attribute SEO** is for your site, not for our servers.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* 9. Use Cases Section */}
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">Who We Help</p>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold font-headline">Built for Creators and Marketers</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">If you work with images online, you'll find MetaMagic indispensable.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-5xl mx-auto">
                    <div className="flex flex-col items-center">
                        <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 mb-4"><Users className="h-8 w-8 text-primary"/></div>
                        <h3 className="font-semibold text-lg">Photographers</h3>
                        <p className="text-muted-foreground text-sm mt-1">Generate commercially-viable titles, descriptions, and keywords for stock photo sites like Adobe Stock and Getty in seconds.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 mb-4"><Globe className="h-8 w-8 text-primary"/></div>
                        <h3 className="font-semibold text-lg">E-Commerce Stores</h3>
                        <p className="text-muted-foreground text-sm mt-1">Optimize thousands of product images with descriptive **alternative text SEO** to improve your Google Shopping and organic search visibility.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 mb-4"><BookOpen className="h-8 w-8 text-primary"/></div>
                        <h3 className="font-semibold text-lg">Bloggers & Publishers</h3>
                        <p className="text-muted-foreground text-sm mt-1">Ensure every image in your articles has a proper **alt picture** tag, boosting your **SEO image alt text** and making your content more accessible.</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 mb-4"><Layers className="h-8 w-8 text-primary"/></div>
                        <h3 className="font-semibold text-lg">Agencies & Developers</h3>
                        <p className="text-muted-foreground text-sm mt-1">Audit and fix entire client websites in minutes. Our WordPress integration makes **adding alt text to images** a billable service that takes you almost no time to complete.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* 8. AI Power Explained Section */}
        <section className="py-20 md:py-28 bg-muted/50">
            <div className="container mx-auto px-4 max-w-4xl">
                 <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-center md:text-left">
                        <p className="text-sm font-semibold uppercase tracking-wider text-primary">The Tech</p>
                        <h2 className="mt-2 text-3xl md:text-4xl font-bold font-headline">Powered by Google's Best AI</h2>
                        <p className="mt-4 text-muted-foreground">This isn't just any AI. MetaMagic is built on Google's state-of-the-art Gemini family of models. We use the right tool for every job:</p>
                        <ul className="mt-4 space-y-2 text-left">
                            <li className="flex items-start gap-3"><Check className="text-primary mt-1 flex-shrink-0"/><span>**Gemini 2.5 Flash:** For lightning-fast text generation, like writing meta descriptions.</span></li>
                            <li className="flex items-start gap-3"><Check className="text-primary mt-1 flex-shrink-0"/><span>**Gemini Pro Vision:** For its incredible ability to analyze and understand the content of your images, which is key for high-quality **alt text for images**.</span></li>
                        </ul>
                         <p className="mt-4 text-muted-foreground">This multi-model approach means you get exceptionally high-quality **alt text AI** that understands nuance and context, far beyond simple object recognition. We follow all **alt text guidelines** to ensure the output is top-notch.</p>
                    </div>
                    <div className="flex justify-center">
                        <BrainCircuit className="h-48 w-48 text-primary/30" />
                    </div>
                </div>
            </div>
        </section>


        {/* 11. Success Metrics Section */}
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">The Results Speak for Themselves</h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">Our users see tangible improvements in their SEO and productivity.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
                    <div className="p-6 border rounded-lg">
                        <div className="text-4xl font-extrabold text-primary">80%</div>
                        <p className="font-semibold mt-2">Time Saved on Metadata</p>
                        <p className="text-sm text-muted-foreground mt-1">Stop the manual grind. What used to take hours now takes minutes.</p>
                    </div>
                    <div className="p-6 border rounded-lg">
                        <div className="text-4xl font-extrabold text-primary">15%</div>
                        <p className="font-semibold mt-2">Increase in Organic CTR</p>
                        <p className="text-sm text-muted-foreground mt-1">Better meta descriptions lead to more clicks from search results.</p>
                    </div>
                    <div className="p-6 border rounded-lg">
                        <div className="text-4xl font-extrabold text-primary">2X</div>
                        <p className="font-semibold mt-2">More Image Search Traffic</p>
                        <p className="text-sm text-muted-foreground mt-1">Proper **image alt attributes SEO** is your ticket to higher rankings in Google Images.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* 4. Testimonials Section */}
        <section className="py-20 md:py-28 bg-muted/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">Don't Just Take Our Word For It</p>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold font-headline">Loved by Creators and Marketers</h2>
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
                           <Card className="h-full flex flex-col bg-background border-border shadow-sm">
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


        {/* 12. Tips / Blog Snippets */}
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-4 max-w-5xl">
                 <div className="text-center mb-16">
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">From Our Playbook</p>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold font-headline">Quick Tips for Better Image SEO</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                     <Card className="bg-background">
                        <CardHeader>
                            <CardTitle className="text-lg">Be Descriptive, Not Spammy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">Good **alt text** describes the image. Bad alt text is just a list of keywords. Instead of `alt="dog cat pet buy"`, write `alt="A golden retriever playing with a calico cat in a sunny field"`. It's better for **alt tags SEO** and users.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-background">
                        <CardHeader>
                            <CardTitle className="text-lg">Don't Forget the `title`</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">The **alt title** attribute, while less important for SEO than the **alt attribute**, provides a tooltip on hover. It's a small UX win. Our tool generates both for you.</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-background">
                        <CardHeader>
                            <CardTitle className="text-lg">Context is King</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">Your `alt` tag should reflect the context of the page. If an image of a laptop is on a page selling that laptop, include the model name in the alt text. This is a key part of our AI's process.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        {/* 13. Integrations Section */}
        <section className="py-20 md:py-28 bg-muted/50">
            <div className="container mx-auto px-4 text-center">
                 <p className="text-sm font-semibold uppercase tracking-wider text-primary">Plays Well With Others</p>
                <h2 className="mt-2 text-3xl md:text-4xl font-bold font-headline">Seamless Integrations</h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">We connect with the tools you already use.</p>
                <div className="mt-12 flex justify-center items-center gap-12">
                    <div className="flex flex-col items-center gap-2">
                        <Image src="https://raw.githubusercontent.com/firebase/firebase-brand-guidelines/main/static/images/brand-guidelines/logo-logomark.svg" width={64} height={64} alt="Firebase Logo" data-ai-hint="logo" />
                        <span className="font-semibold">Firebase</span>
                        <p className="text-sm text-muted-foreground">For secure user authentication and data storage.</p>
                    </div>
                     <div className="flex flex-col items-center gap-2">
                        <Image src="https://upload.wikimedia.org/wikipedia/commons/2/20/WordPress_logo.svg" width={64} height={64} alt="WordPress Logo" data-ai-hint="logo" />
                        <span className="font-semibold">WordPress</span>
                        <p className="text-sm text-muted-foreground">For direct media library integration.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Image src="https://www.gstatic.com/images/branding/product/1x/gemini_48dp.png" width={64} height={64} alt="Google Gemini Logo" data-ai-hint="logo" />
                        <span className="font-semibold">Google Gemini</span>
                        <p className="text-sm text-muted-foreground">The AI engine powering our metadata generation.</p>
                    </div>
                </div>
                 <p className="text-xs text-muted-foreground mt-8">Our tool generates a standard CSV for stock sites, making your life easier.</p>
            </div>
        </section>


        {/* 5. FAQ Section */}
        <section className="py-20 md:py-28">
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

        {/* 14. Final CTA Section */}
        <section className="py-24 md:py-32 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <Zap className="h-12 w-12 text-primary mx-auto" />
            <h2 className="mt-4 text-3xl md:text-4xl font-bold font-headline text-balance">Ready to Revolutionize Your SEO Workflow?</h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground text-balance">
              You're seconds away from taking the guesswork out of your metadata. Stop leaving traffic and money on the table. The perfect **alternative text** for your images is just a click away.
            </p>
            <div className="mt-10">
              <Button asChild size="lg" className="group">
                <Link href="/signup">Claim Your Free Account Now <ChevronRight className="ml-2 transition-transform group-hover:translate-x-1" /></Link>
              </Button>
            </div>
             <p className="mt-4 text-sm text-muted-foreground">It's free forever. Your only cost is your own API usage.</p>
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
