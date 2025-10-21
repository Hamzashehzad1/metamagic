
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
    
    // Corrected isLoading logic: It must remain true as long as the initial user check is running.
    const isLoading = isUserLoading || (user && isProfileLoading);

    const isAuthRoute = pathname === '/login' || pathname === '/signup';
    const isPublicRoute = pathname === '/' || pathname === '/pricing';
    const isAdminRoute = pathname.startsWith('/admin');

    useEffect(() => {
        // Wait until all loading is complete before running redirection logic
        if (isLoading) {
            return;
        }

        // If user is not logged in, redirect to login page unless on a public route
        if (!user && !isAuthRoute && !isPublicRoute) {
            router.push('/login');
            return;
        }
        
        // If user is logged in, redirect away from public/auth routes
        if (user && (isAuthRoute || isPublicRoute)) {
            router.push('/dashboard');
            return;
        }

        // If user tries to access admin route but is not an admin, redirect
        // This check only runs if user and userProfile are loaded.
        if (user && isAdminRoute && userProfile && !userProfile.isAdmin) {
            router.push('/dashboard');
            return;
        }

    }, [user, userProfile, isLoading, router, pathname, isAuthRoute, isPublicRoute, isAdminRoute]);

    // Show a loading spinner while the initial auth check is happening or a redirect is imminent.
    if (isLoading || (!user && !isAuthRoute && !isPublicRoute) || (user && (isAuthRoute || isPublicRoute))) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    // If we've passed all checks, render the children.
    return <>{children}</>;
}
