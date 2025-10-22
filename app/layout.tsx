import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SecureText Transfer',
  description: 'Client-side file encryption',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-900 text-white min-h-screen`}
      >
        <main className="p-6 sm:p-8">{children}</main>
      </body>
    </html>
  );
}