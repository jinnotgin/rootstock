import * as React from 'react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, Input } from '@/components/ui/app-form';
import { FormDrawer } from '@/components/ui/form-drawer';
import { useAdminModels, useUpdateUser } from '@/lib/admin';
import { User } from '@/types/api';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const schema = z.object({
	customLimitUsd: z.coerce.number().min(0).nullable(),
});

type FormValues = z.infer<typeof schema>;

type Props = { user: User };

export const EditUserDrawer = ({ user }: Props) => {
	const updateUser = useUpdateUser();
	const { data: allModels = [] } = useAdminModels();
	const [selectedModelIds, setSelectedModelIds] = React.useState<string[]>(user.allowedModelIds);

	const toggleModel = (modelId: string) => {
		setSelectedModelIds((prev) =>
			prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId],
		);
	};

	return (
		<FormDrawer
			title={`Edit ${user.email}`}
			isDone={updateUser.isSuccess}
			triggerButton={
				<Button variant="outline" size="sm" aria-label={`Edit ${user.email}`}>
					Edit
				</Button>
			}
			submitButton={
				<Button type="submit" form={`edit-user-form-${user.id}`} disabled={updateUser.isPending}>
					{updateUser.isPending ? 'Saving…' : 'Save'}
				</Button>
			}
		>
			<Form
				id={`edit-user-form-${user.id}`}
				schema={schema}
				options={{ defaultValues: { customLimitUsd: user.customLimitUsd ?? 0 } }}
				onSubmit={(values: FormValues) => {
					updateUser.mutate({
						userId: user.id,
						input: {
							allowedModelIds: selectedModelIds,
							customLimitUsd: values.customLimitUsd || null,
						},
					});
				}}
			>
				{({ register, formState: { errors } }) => (
					<div className="space-y-4">
						{updateUser.isError && (
							<div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
								{updateUser.error?.message}
							</div>
						)}

						<div className="space-y-2">
							<Label>Model Access</Label>
							{allModels.map((model) => (
								<div key={model.id} className="flex items-center gap-2">
									<Checkbox
										id={`model-${model.id}-${user.id}`}
										checked={selectedModelIds.includes(model.id)}
										onCheckedChange={() => toggleModel(model.id)}
									/>
									<label htmlFor={`model-${model.id}-${user.id}`} className="text-sm">
										{model.name}
									</label>
								</div>
							))}
						</div>

						<Input
							label="Custom weekly limit ($, 0 = use global default)"
							type="number"
							id={`edit-user-limit-${user.id}`}
							registration={register('customLimitUsd')}
							error={errors.customLimitUsd}
						/>
					</div>
				)}
			</Form>
		</FormDrawer>
	);
};
