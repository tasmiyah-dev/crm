"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export const Shell = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    useEffect(() => {
        if (!loading && !user && !isAuthPage) {
            router.push('/login');
        }
    }, [loading, user, isAuthPage, router]);

    if (loading) return <div className="h-full flex items-center justify-center">Loading...</div>;

    if (isAuthPage) {
        return <div className="h-full bg-white">{children}</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="h-full">
            <Sidebar />
            <main className="pl-64 h-full">
                <div className="py-10 px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
