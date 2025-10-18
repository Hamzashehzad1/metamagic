
'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isUserLoading) {
            const isAuthRoute = pathname === '/login' || pathname === '/signup';
            const isLandingPage = pathname === '/';

            // If user is not logged in, redirect to login page, unless they are on the landing page or an auth route
            if (!user && !isAuthRoute && !isLandingPage) {
                router.push('/login');
            }
            
            // If user is logged in, redirect away from login/signup/landing
            if (user && (isAuthRoute || isLandingPage)) {
                router.push('/dashboard');
            }
        }
    }, [user, isUserLoading, router, pathname]);

    // Show a loader while user is being checked, or if we are about to redirect
    if (isUserLoading || (user && (pathname === '/login' || pathname === '/signup' || pathname === '/')) || (!user && pathname !== '/' && pathname !== '/login' && pathname !== '/signup')) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return <>{children}</>;
}
