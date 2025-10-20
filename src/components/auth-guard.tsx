
'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';

interface UserProfile {
    isAdmin?: boolean;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const firestore = useFirestore();

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, `users/${user.uid}`);
    }, [firestore, user]);
    
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    useEffect(() => {
        const isLoading = isUserLoading || isProfileLoading;
        if (!isLoading) {
            const isAuthRoute = pathname === '/login' || pathname === '/signup';
            const isLandingRoute = pathname === '/' || pathname === '/pricing';
            const isAdminRoute = pathname.startsWith('/admin');

            // If user is not logged in, redirect to login page unless on a public-only route
            if (!user && !isAuthRoute && !isLandingRoute) {
                router.push('/login');
            }
            
            // If user is logged in, redirect away from landing/auth routes
            if (user && (isAuthRoute || isLandingRoute)) {
                router.push('/dashboard');
            }

            // If user tries to access admin route but is not an admin, redirect
            if (user && isAdminRoute && !userProfile?.isAdmin) {
                router.push('/dashboard');
            }
        }
    }, [user, userProfile, isUserLoading, isProfileLoading, router, pathname]);

    const isRedirecting = 
        (user && (pathname === '/login' || pathname === '/signup' || pathname === '/' || pathname === '/pricing')) || 
        (!user && pathname !== '/' && pathname !== '/pricing' && pathname !== '/login' && pathname !== '/signup') ||
        (user && pathname.startsWith('/admin') && !userProfile?.isAdmin);

    if (isUserLoading || isProfileLoading || isRedirecting) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return <>{children}</>;
}
