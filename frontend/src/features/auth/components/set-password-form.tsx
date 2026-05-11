import { User } from '@/domain/types';
import { Error, Form, Input } from '@/components/ui/app-form';
import { Button } from '@/components/ui/button';
import { setPasswordInputSchema, useSetPassword } from '@/lib/auth';

type Props = {
	email: string;
	onSuccess: (user: User) => void;
};

export const SetPasswordForm = ({ email, onSuccess }: Props) => {
	const setPassword = useSetPassword({
		onSuccess,
	});

	return (
		<Form
			schema={setPasswordInputSchema}
			onSubmit={(values) => setPassword.mutate({ email, password: values.password })}
		>
			{({ register, formState: { errors } }) => (
				<>
					{setPassword.isError && (
						<div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							{setPassword.error?.message}
						</div>
					)}

					<Input
						label="Password"
						type="password"
						id="password"
						autoComplete="new-password"
						registration={register('password')}
						error={errors.password}
					/>

					<Input
						label="Confirm Password"
						type="password"
						id="confirmPassword"
						autoComplete="new-password"
						registration={register('confirmPassword')}
						error={errors.confirmPassword}
					/>

					<Button type="submit" className="w-full" disabled={setPassword.isPending}>
						{setPassword.isPending ? 'Setting password…' : 'Set password'}
					</Button>
				</>
			)}
		</Form>
	);
};
