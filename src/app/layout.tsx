
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: '700', variable: '--font-space-grotesk' });


export const metadata: Metadata = {
  title: 'MetaMagic - AI-Powered SEO Metadata Generator',
  description: 'Automate your image SEO with MetaMagic. Generate AI-powered alt text, alt tags, and meta descriptions in seconds—boost rankings, accessibility, and traffic.',
  alternates: {
    canonical: 'https://metamagic.cloud/',
  },
  openGraph: {
    title: 'MetaMagic - AI-Powered SEO Metadata Generator',
    description: 'Automate your image SEO with MetaMagic. Generate AI-powered alt text, alt tags, and meta descriptions in seconds—boost rankings, accessibility, and traffic.',
    url: 'https://metamagic.cloud',
    siteName: 'MetaMagic',
    images: [
      {
        url: 'https://metamagic.cloud/og-image.png',
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
    description: 'Automate your image SEO with MetaMagic. Generate AI-powered alt text, alt tags, and meta descriptions in seconds—boost rankings, accessibility, and traffic.',
    creator: '@webbrewery',
    images: ['https://metamagic.cloud/twitter-image.png'],
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
  verification: {
    google: 'EywvD6AaP0O3W_Kb7fnaD6OrFOgCQj5U_ic6E-KGw1w',
  },
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
    "url": "https://metamagic.cloud",
    "logo": "https://metamagic.cloud/icon.svg",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${inter.className} ${spaceGrotesk.className} font-body antialiased`}>
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
