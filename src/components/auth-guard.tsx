
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

            // If user is not logged in, redirect to login page
            if (!user && !isAuthRoute) {
                router.push('/login');
            }
            
            // If user is logged in, redirect away from login/signup
            if (user && isAuthRoute) {
                router.push('/');
            }
        }
    }, [user, isUserLoading, router, pathname]);

    if (isUserLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    // Prevent rendering children on auth routes if user is loaded
    if (user && (pathname === '/login' || pathname === '/signup')) {
         return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    // Prevent rendering children of protected routes if user is not loaded
    if (!user && pathname !== '/login' && pathname !== '/signup') {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
