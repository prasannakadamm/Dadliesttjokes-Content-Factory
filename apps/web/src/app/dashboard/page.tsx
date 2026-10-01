'use client';

import { useAuth } from '../../components/AuthProvider';

export default function DashboardHome() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
      <div className="rounded-lg bg-card border border-border p-6 shadow-sm">
        <h2 className="text-lg font-medium text-white mb-2">Welcome back, {user?.email}</h2>
        <p className="text-muted">
          Your content factory foundation is active and secure. Future modules will appear here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-lg bg-card border border-border p-6 opacity-60">
          <h3 className="text-md font-medium text-white mb-1 flex justify-between">
            Content Status{' '}
            <span className="text-xs bg-border px-2 py-0.5 rounded-full">Phase 05</span>
          </h3>
          <p className="text-sm text-muted">
            AI content generation metrics will be available in the next phase.
          </p>
        </div>
        <div className="rounded-lg bg-card border border-border p-6 opacity-60">
          <h3 className="text-md font-medium text-white mb-1 flex justify-between">
            Video Engine{' '}
            <span className="text-xs bg-border px-2 py-0.5 rounded-full">Coming Soon</span>
          </h3>
          <p className="text-sm text-muted">OpenShorts integration and rendering jobs.</p>
        </div>
        <div className="rounded-lg bg-card border border-border p-6 opacity-60">
          <h3 className="text-md font-medium text-white mb-1 flex justify-between">
            Publishing{' '}
            <span className="text-xs bg-border px-2 py-0.5 rounded-full">Coming Soon</span>
          </h3>
          <p className="text-sm text-muted">Social media publishing queues and analytics.</p>
        </div>
      </div>
    </div>
  );
}
