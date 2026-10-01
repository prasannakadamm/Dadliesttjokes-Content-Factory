import type { Metadata } from 'next';
import React from 'react';
import './globals.css';

import { AuthProvider } from '../components/AuthProvider';

export const metadata: Metadata = {
  title: 'Dadliesttjokes Content Factory',
  description: 'AI content automation platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
