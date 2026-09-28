import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Dadliesttjokes Content Factory — Foundation',
  description: 'Engineering Foundation for Dadliesttjokes Content Factory',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          backgroundColor: '#0a0a0c',
          color: '#f0f0f5',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </body>
    </html>
  );
}
