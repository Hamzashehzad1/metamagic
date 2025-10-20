'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function UserManagementPage() {
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
                        A searchable and sortable table of all users will be implemented here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center">Coming soon...</p>
                </CardContent>
            </Card>
        </div>
    );
}
