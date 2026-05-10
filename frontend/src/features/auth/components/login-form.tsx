import { User } from '@/domain/types';
import { Error, Form, Input } from '@/components/ui/app-form';
import { Button } from '@/components/ui/button';
import { loginInputSchema, useLogin } from '@/lib/auth';

type Props = {
	onSuccess: (user: User) => void;
	onNeedsPassword: (email: string) => void;
};

export const LoginForm = ({ onSuccess, onNeedsPassword }: Props) => {
	const login = useLogin({
		onSuccess,
		onError: (error) => {
			const err = error as Error & { code?: string; email?: string };
			if (err.code === 'PASSWORD_NOT_SET' && err.email) {
				onNeedsPassword(err.email);
			}
		},
	});

	return (
		<Form
			schema={loginInputSchema}
			onSubmit={(values) => login.mutate(values)}
		>
			{({ register, formState: { errors } }) => (
				<>
					{login.isError && !(login.error as any)?.code && (
						<div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							{login.error?.message}
						</div>
					)}

					<Input
						label="Email"
						type="email"
						id="email"
						autoComplete="email"
						registration={register('email')}
						error={errors.email}
					/>

					<Input
						label="Password"
						type="password"
						id="password"
						autoComplete="current-password"
						registration={register('password')}
						error={errors.password}
					/>

					<Button type="submit" className="w-full" disabled={login.isPending}>
						{login.isPending ? 'Signing in…' : 'Sign in'}
					</Button>
				</>
			)}
		</Form>
	);
};
