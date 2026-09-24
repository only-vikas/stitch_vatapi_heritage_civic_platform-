import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { IssueProvider } from '@/context/IssueContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vatapi | AI-Powered Heritage Tourism & Civic Grid',
  description:
    'Bagalkote district civic infrastructure, heritage preservation triage, authentic Ooru Oota dining, and GI-certified handloom artisan collective.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#fbf9f6] text-[#1b1c1a]">
        <AuthProvider>
          <IssueProvider>
            {children}
          </IssueProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
