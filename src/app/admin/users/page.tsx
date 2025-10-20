
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    createdAt?: { seconds: number; nanoseconds: number };
    isAdmin?: boolean;
}

export default function UserManagementPage() {
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

    return (
        <div>
            <section className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
                    User Management
                </h1>
                <p className="mt-4 text-lg md:text-xl max-w-3xl text-muted-foreground">
                    View, search, and manage all registered users.
                </p>
            </section>
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                        A list of all users in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingUsers ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Display Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead>Role</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users?.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.displayName || 'N/A'}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {user.createdAt
                                                    ? formatDistanceToNow(new Date(user.createdAt.seconds * 1000), { addSuffix: true })
                                                    : 'Unknown'}
                                            </TableCell>
                                            <TableCell>
                                                {user.isAdmin ? (
                                                    <Badge>Admin</Badge>
                                                ) : (
                                                    <Badge variant="outline">User</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
