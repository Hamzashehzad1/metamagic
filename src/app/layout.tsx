import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'MetaMagic - AI-Powered SEO Metadata Generator',
  description: 'Generate perfect, SEO-optimized titles, descriptions, and keywords for your images and content in seconds. Boost your SEO with AI.',
  alternates: {
    canonical: 'https://metamagic.cloud/',
  },
  openGraph: {
    title: 'MetaMagic - AI-Powered SEO Metadata Generator',
    description: 'Stop guessing. Start dominating your media SEO with AI-generated metadata.',
    url: 'https://metamagic.cloud', // Use the new domain
    siteName: 'MetaMagic',
    images: [
      {
        url: 'https://metamagic.cloud/og-image.png', // Use the new domain
        width: 1200,
        height: 630,
        alt: 'MetaMagic Logo and Tagline',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MetaMagic - AI-Powered SEO Metadata Generator',
    description: 'Stop guessing. Start dominating your media SEO with AI-generated metadata.',
    creator: '@webbrewery',
    images: ['https://metamagic.cloud/twitter-image.png'], // Use the new domain
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  themeColor: 'hsl(273 67% 61%)',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MetaMagic",
    "url": "https://metamagic.cloud", // Use the new domain
    "logo": "https://metamagic.cloud/icon.svg", // Use the new domain
    "description": "AI-powered metadata generation for images and web content to improve SEO.",
    "sameAs": []
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "MetaMagic",
    "description": "An AI-powered SaaS application that generates SEO-optimized metadata for images and web content.",
    "applicationCategory": "SEO Tool",
    "operatingSystem": "Web",
    "url": "https://metamagic.cloud/",
    "publisher": {
      "@type": "Organization",
      "name": "MetaMagic"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            {children}
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
