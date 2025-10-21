
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

    useEffect(() => {
        if (isLoading) return; // Don't do anything until loading is complete

        // If user is not logged in, redirect to login page unless on a public route
        if (!user && !isAuthRoute && !isPublicRoute) {
            router.push('/login');
        }
        
        // If user is logged in, redirect away from public/auth routes
        if (user && (isAuthRoute || isPublicRoute)) {
            router.push('/dashboard');
        }

        // If user tries to access admin route but is not an admin, redirect
        if (user && isAdminRoute && userProfile && !userProfile.isAdmin) {
            router.push('/dashboard');
        }
    }, [user, userProfile, isLoading, router, pathname, isAuthRoute, isPublicRoute, isAdminRoute]);

    // Show a loading spinner while the initial auth check is happening.
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    // --- CRITICAL FIX ---
    // Show a loading spinner if a redirect is about to happen.
    // This prevents rendering the children of a page the user shouldn't see.
    if ((!user && !isAuthRoute && !isPublicRoute) || (user && (isAuthRoute || isPublicRoute))) {
         return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    // If we've passed all checks, render the children.
    return <>{children}</>;
}
