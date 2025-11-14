import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { AppNav } from '@/components/app-nav';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Jaspers AI – Portfolio Chat',
  description:
    'Minimal portfolio assistant that syncs Alpaca holdings and provides AI answers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 text-slate-900 antialiased`}
      >
        <AuthProvider>
          <AppNav />
          <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-5xl px-4 py-10">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
