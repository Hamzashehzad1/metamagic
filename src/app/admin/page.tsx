
'use client';

import { Header } from '@/components/header';
import AuthGuard from '@/components/auth-guard';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function AdminPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tighter">
                Admin Dashboard
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                Welcome, Admin. This is the central hub for managing your application.
            </p>
        </section>

        <div className="grid gap-8 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                    <CardDescription>
                        This is where the user statistics, charts, and recent activity will be displayed.
                    </CardDescription>
                </CardHeader>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                        A searchable and sortable table of all users will be implemented here.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
      </main>
    </div>
  );
}

export default function AdminPageWithAuth() {
    return (
        <AuthGuard>
            <AdminPage />
        </AuthGuard>
    )
}
