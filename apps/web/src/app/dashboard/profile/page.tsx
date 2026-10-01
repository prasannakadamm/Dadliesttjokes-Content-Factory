'use client';

import { useAuth } from '../../../components/AuthProvider';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Account Profile</h1>

      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h3 className="text-base font-semibold leading-6 text-white">Personal Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted">Details and account settings.</p>
        </div>
        <div className="px-6 py-5">
          <dl className="space-y-4">
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-white">Email address</dt>
              <dd className="mt-1 text-sm leading-6 text-muted sm:col-span-2 sm:mt-0">
                {user?.email}
              </dd>
            </div>
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-white">Account ID</dt>
              <dd className="mt-1 text-sm leading-6 text-muted sm:col-span-2 sm:mt-0">
                {user?.id}
              </dd>
            </div>
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-white">Role</dt>
              <dd className="mt-1 text-sm leading-6 text-muted sm:col-span-2 sm:mt-0 capitalize">
                {user?.role}
              </dd>
            </div>
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-white">Member since</dt>
              <dd className="mt-1 text-sm leading-6 text-muted sm:col-span-2 sm:mt-0">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
