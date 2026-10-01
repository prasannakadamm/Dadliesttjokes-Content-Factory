'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (!loading && user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Dadliesttjokes Content Factory
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted">
          Phase 04 — Web Dashboard Foundation. A cloud-based AI content automation platform.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/login"
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold leading-6 text-white hover:text-white/80"
          >
            Create account <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
