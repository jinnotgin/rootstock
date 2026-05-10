import { Link } from 'react-router';
import { paths } from '@/config/paths';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-300">404</h1>
      <p className="text-gray-500">Page not found.</p>
      <Link to={paths.auth.login} className="text-sm text-indigo-600 hover:underline">
        Go to login
      </Link>
    </div>
  );
}
