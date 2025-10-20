import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'MetaMagic - AI-Powered SEO Metadata Generator',
  description: 'Generate perfect, SEO-optimized titles, descriptions, and keywords for your images and content in seconds. Boost your SEO with AI.',
  openGraph: {
    title: 'MetaMagic - AI-Powered SEO Metadata Generator',
    description: 'Stop guessing. Start dominating your media SEO with AI-generated metadata.',
    url: 'https://metamagic.app', // Replace with your actual domain
    siteName: 'MetaMagic',
    // It's recommended to host an image specifically for social sharing
    images: [
      {
        url: 'https://metamagic.app/og-image.png', // Replace with your actual Open Graph image URL
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
     // Replace with your actual Twitter handle if you have one
    creator: '@webbrewery',
    images: ['https://metamagic.app/twitter-image.png'], // Replace with your actual Twitter image URL
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
  // If you have a specific theme color for browsers
  themeColor: 'hsl(273 67% 61%)',
  // Verification tags for search consoles if you have them
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MetaMagic",
    "url": "https://metamagic.app", // Replace with your actual domain
    "logo": "https://metamagic.app/icon.svg", // Replace with your actual logo URL
    "description": "AI-powered metadata generation for images and web content to improve SEO.",
    "sameAs": [
      // Add links to your social media profiles here
      // "https://twitter.com/your-twitter-handle"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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
