import React from 'react';

export default function HomePage() {
  return (
    <main
      style={{
        padding: '3rem 1.5rem',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#ffffff' }}>
          Dadliesttjokes Content Factory
        </h1>
        <p style={{ color: '#8e8ea0', fontSize: '1rem', margin: 0 }}>
          Phase 02 — Development Foundation Baseline
        </p>
      </header>

      <section
        style={{
          backgroundColor: '#16161e',
          borderRadius: '8px',
          border: '1px solid #2a2a38',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', marginTop: 0, color: '#e0e0ec' }}>Foundation Status</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0 0', lineHeight: '2' }}>
          <li>
            <strong style={{ color: '#4ade80' }}>✓</strong> Web Foundation: Next.js App Router
            (Active)
          </li>
          <li>
            <strong style={{ color: '#4ade80' }}>✓</strong> API Gateway Boundary: Fastify
            Micro-service (Configured)
          </li>
          <li>
            <strong style={{ color: '#4ade80' }}>✓</strong> Monorepo Workspace: pnpm 12.6.0 (Active)
          </li>
          <li>
            <strong style={{ color: '#4ade80' }}>✓</strong> TypeScript & Tooling: Strict
            Configuration (Verified)
          </li>
        </ul>
      </section>

      <footer
        style={{
          borderTop: '1px solid #222230',
          paddingTop: '1rem',
          fontSize: '0.875rem',
          color: '#6e6e80',
        }}
      >
        <p style={{ margin: 0 }}>
          Engineering Foundation Only. Product features, authentication, dashboard UI, and media
          engines are deferred to future phases according to the project roadmap.
        </p>
      </footer>
    </main>
  );
}
