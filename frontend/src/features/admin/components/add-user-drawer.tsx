import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, Input, Select } from '@/components/ui/app-form';
import { FormDrawer } from '@/components/ui/form-drawer';
import { useAdminModels, useCreateUser } from '@/lib/admin';

const schema = z.object({
	email: z.string().min(1, 'Required').email('Invalid email'),
	role: z.enum(['USER', 'ADMIN']),
	customLimitUsd: z.coerce.number().min(0).nullable(),
});

type FormValues = z.infer<typeof schema>;

export const AddUserDrawer = () => {
	const createUser = useCreateUser();
	const { data: models = [] } = useAdminModels();

	return (
		<FormDrawer
			title="Add User"
			isDone={createUser.isSuccess}
			triggerButton={<Button size="sm">Add User</Button>}
			submitButton={
				<Button type="submit" form="add-user-form" disabled={createUser.isPending}>
					{createUser.isPending ? 'Adding…' : 'Add User'}
				</Button>
			}
		>
			<Form
				id="add-user-form"
				schema={schema}
				onSubmit={(values: FormValues) => {
					createUser.mutate({
						email: values.email,
						role: values.role,
						allowedModelIds: models.filter((m) => m.isActive).map((m) => m.id),
						customLimitUsd: values.customLimitUsd,
					});
				}}
			>
				{({ register, formState: { errors } }) => (
					<div className="space-y-4">
						{createUser.isError && (
							<div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
								{createUser.error?.message}
							</div>
						)}
						<Input
							label="Email"
							type="email"
							id="add-user-email"
							registration={register('email')}
							error={errors.email}
						/>
						<Select
							label="Role"
							registration={register('role')}
							options={[
								{ label: 'User', value: 'USER' },
								{ label: 'Admin', value: 'ADMIN' },
							]}
						/>
						<Input
							label="Custom weekly limit ($, leave 0 for global default)"
							type="number"
							id="add-user-limit"
							registration={register('customLimitUsd')}
							error={errors.customLimitUsd}
						/>
					</div>
				)}
			</Form>
		</FormDrawer>
	);
};
