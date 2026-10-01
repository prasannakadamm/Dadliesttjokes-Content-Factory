'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Safely log error without exposing raw error object to the client console
    console.error(`Error digest: ${error.digest || 'N/A'}`);
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Error message: ${error.message}`);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <p className="text-base font-semibold text-red-500">Error</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Something went wrong
        </h1>
        <p className="mt-6 text-base leading-7 text-muted">
          An unexpected error occurred while loading this page.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button
            onClick={() => reset()}
            className="rounded-md bg-border px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-border/80"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
