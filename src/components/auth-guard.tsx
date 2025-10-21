
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
        console.log('AuthGuard: Effect triggered.');
        console.log(`AuthGuard: Pathname: ${pathname}`);
        console.log(`AuthGuard: IsLoading: ${isLoading}`);
        if (isLoading) {
            console.log("AuthGuard: Still loading user or profile, skipping redirection logic.");
            return;
        }

        console.log(`AuthGuard: User: ${user ? user.uid : 'null'}`);
        console.log(`AuthGuard: isAuthRoute: ${isAuthRoute}, isPublicRoute: ${isPublicRoute}, isAdminRoute: ${isAdminRoute}`);
        if (userProfile) {
            console.log(`AuthGuard: User profile loaded, isAdmin: ${!!userProfile.isAdmin}`);
        }


        // If user is not logged in, redirect to login page unless on a public route
        if (!user && !isAuthRoute && !isPublicRoute) {
            console.log("AuthGuard: User not logged in and not on a public/auth route. Redirecting to /login.");
            router.push('/login');
            return;
        }
        
        // If user is logged in, redirect away from public/auth routes
        if (user && (isAuthRoute || isPublicRoute)) {
            console.log("AuthGuard: User is logged in but on a public/auth route. Redirecting to /dashboard.");
            router.push('/dashboard');
            return;
        }

        // If user tries to access admin route but is not an admin, redirect
        if (user && isAdminRoute && userProfile && !userProfile.isAdmin) {
            console.log("AuthGuard: User is not an admin but trying to access an admin route. Redirecting to /dashboard.");
            router.push('/dashboard');
            return;
        }

        console.log("AuthGuard: All checks passed, no redirection needed.");

    }, [user, userProfile, isLoading, router, pathname, isAuthRoute, isPublicRoute, isAdminRoute]);

    // Show a loading spinner while the initial auth check is happening.
    if (isLoading) {
        console.log('AuthGuard: Rendering loading spinner because isLoading is true.');
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    // While a redirect is being processed by the useEffect, show a loader
    if (!user && !isAuthRoute && !isPublicRoute) {
         console.log('AuthGuard: Rendering loading spinner while redirecting to /login.');
         return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (user && (isAuthRoute || isPublicRoute)) {
        console.log('AuthGuard: Rendering loading spinner while redirecting to /dashboard.');
         return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    // If we've passed all checks, render the children.
    console.log('AuthGuard: Rendering children.');
    return <>{children}</>;
}
