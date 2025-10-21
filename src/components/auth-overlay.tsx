
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export function AuthOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
      <div className="text-center p-8 bg-background/80 rounded-xl shadow-2xl border border-border">
        <Lock className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-6 text-2xl font-bold font-headline tracking-tight text-foreground">
          Unlock the Full Dashboard
        </h2>
        <p className="mt-2 text-md text-muted-foreground max-w-md mx-auto">
          Sign up for a free account to generate metadata, manage your content, and boost your SEO.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/signup">Sign Up for Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
