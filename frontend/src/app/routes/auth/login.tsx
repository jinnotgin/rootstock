import { useNavigate, useSearchParams } from 'react-router';

import { AuthLayout } from '@/components/layouts/auth-layout';
import { LoginForm } from '@/features/auth/components/login-form';
import { paths } from '@/config/paths';

export default function LoginRoute() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get('redirectTo');

	return (
		<AuthLayout title="Sign in to your account">
			<LoginForm
				onSuccess={() => {
					navigate(redirectTo ?? paths.app.dashboard.getHref(), { replace: true });
				}}
				onNeedsPassword={(email) => {
					navigate(paths.auth.setPassword.getHref(email), { replace: true });
				}}
			/>
		</AuthLayout>
	);
}
