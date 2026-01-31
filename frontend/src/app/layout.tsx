import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Shell } from '@/components/Shell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nexusware',
  description: 'Power your outreach with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-100">
      <body className={`${inter.className} h-full`}>
        <AuthProvider>
          {/* Debug banner removed */}
          <Shell>
            {children}
          </Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
