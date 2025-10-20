
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, collectionGroup } from 'firebase/firestore';
import { type ApiKey, type WpConnection } from '../account/page';
import { Loader2, Users, KeyRound, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UserProfile {
    id: string;
    email: string;
    displayName: string;
}

function AdminPage() {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

  const [totalApiKeys, setTotalApiKeys] = useState<number | null>(null);
  const [totalWpConnections, setTotalWpConnections] = useState<number | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (firestore) {
        setIsLoadingStats(true);
        try {
          const apiKeysQuery = collectionGroup(firestore, 'geminiApiKeys');
          const wpConnectionsQuery = collectionGroup(firestore, 'wordpressConnections');
          
          const apiKeysSnapshot = await getDocs(apiKeysQuery);
          const wpConnectionsSnapshot = await getDocs(wpConnectionsQuery);

          setTotalApiKeys(apiKeysSnapshot.size);
          setTotalWpConnections(wpConnectionsSnapshot.size);
        } catch (e) {
            console.error("Failed to fetch admin stats", e);
        } finally {
            setIsLoadingStats(false);
        }
      }
    }
    fetchStats();
  }, [firestore]);


  const isLoading = isLoadingUsers || isLoadingStats;
  
  return (
    <div className="flex flex-col">
        <section className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
                Admin Dashboard
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl text-muted-foreground">
                Welcome, Admin. This is the central hub for managing your application.
            </p>
        </section>

        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users?.length ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Registered users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Gemini Keys</CardTitle>
                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalApiKeys ?? 0}</div>
                        <p className="text-xs text-muted-foreground">API keys saved by users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total WP Connections</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalWpConnections ?? 0}</div>
                        <p className="text-xs text-muted-foreground">WordPress sites connected</p>
                    </CardContent>
                </Card>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                    <CardDescription>
                        Charts and graphs for user activity will be displayed here.
                    </CardDescription>
                </CardHeader>
                 <CardContent>
                    <p className="text-muted-foreground text-center">Coming soon...</p>
                 </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                        A feed of recent user actions will be shown here.
                    </CardDescription>
                </CardHeader>
                 <CardContent>
                    <p className="text-muted-foreground text-center">Coming soon...</p>
                 </CardContent>
            </Card>
        </div>
      
    </div>
  );
}

// The main export is wrapped in the AuthGuard and layout which is now defined in layout.tsx
export default AdminPage;
