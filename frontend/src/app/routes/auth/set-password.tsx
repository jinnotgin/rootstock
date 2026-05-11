import { useNavigate, useSearchParams } from 'react-router';

import { AuthLayout } from '@/components/layouts/auth-layout';
import { SetPasswordForm } from '@/features/auth/components/set-password-form';
import { paths } from '@/config/paths';

export default function SetPasswordRoute() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const email = searchParams.get('email') ?? '';

	return (
		<AuthLayout title="Set your password">
			<SetPasswordForm
				email={email}
				onSuccess={() => {
					navigate(paths.app.dashboard.getHref(), { replace: true });
				}}
			/>
		</AuthLayout>
	);
}
