
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
    
    const isLoading = isUserLoading || (user && isProfileLoading);

    const isAuthRoute = pathname === '/login' || pathname === '/signup';
    const isPublicRoute = pathname === '/' || pathname === '/pricing';
    const isAdminRoute = pathname.startsWith('/admin');
    
    // The dashboard is now a special case: it can be viewed by unauthenticated users in a "sneak peek" mode.
    const isSneakPeekRoute = pathname === '/dashboard';

    useEffect(() => {
        if (isLoading) {
            return;
        }

        // If user is logged in, redirect away from auth routes (login/signup)
        if (user && isAuthRoute) {
            router.push('/dashboard');
            return;
        }
        
        // If user is NOT logged in, and tries to access a protected route (that's not public, auth, or sneak-peek-able), redirect to login
        if (!user && !isPublicRoute && !isAuthRoute && !isSneakPeekRoute) {
            router.push('/login');
            return;
        }

        // If a non-admin user tries to access an admin route, redirect
        if (user && isAdminRoute && userProfile && !userProfile.isAdmin) {
            router.push('/dashboard');
            return;
        }

    }, [user, userProfile, isLoading, router, pathname, isAuthRoute, isPublicRoute, isAdminRoute, isSneakPeekRoute]);
    
    // While loading, or if an unauthenticated user is on a page that will redirect, show a loader.
    if (isLoading || (!user && !isPublicRoute && !isAuthRoute && !isSneakPeekRoute) || (user && isAuthRoute)) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    // If we've passed all checks, render the children.
    return <>{children}</>;
}
