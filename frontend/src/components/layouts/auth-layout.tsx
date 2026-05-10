import { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">API Gateway</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to manage your API access</p>
        </div>
        {children}
      </div>
    </div>
  );
}
