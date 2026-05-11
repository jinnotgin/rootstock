import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, Input } from '@/components/ui/app-form';
import { FormDrawer } from '@/components/ui/form-drawer';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUpdateModel } from '@/lib/admin';
import { Model } from '@/types/api';
import { useState } from 'react';

const schema = z.object({
	pricePerInputTokenUsd: z.coerce.number().min(0, 'Must be ≥ 0'),
	pricePerOutputTokenUsd: z.coerce.number().min(0, 'Must be ≥ 0'),
});

type FormValues = z.infer<typeof schema>;

type Props = { model: Model };

export const EditModelDrawer = ({ model }: Props) => {
	const updateModel = useUpdateModel();
	const [isActive, setIsActive] = useState(model.isActive);

	return (
		<FormDrawer
			title={`Edit ${model.name}`}
			isDone={updateModel.isSuccess}
			triggerButton={
				<Button variant="outline" size="sm" aria-label={`Edit ${model.name}`}>
					Edit
				</Button>
			}
			submitButton={
				<Button
					type="submit"
					form={`edit-model-form-${model.id}`}
					disabled={updateModel.isPending}
				>
					{updateModel.isPending ? 'Saving…' : 'Save'}
				</Button>
			}
		>
			<Form
				id={`edit-model-form-${model.id}`}
				schema={schema}
				options={{
					defaultValues: {
						pricePerInputTokenUsd: model.pricePerInputTokenUsd,
						pricePerOutputTokenUsd: model.pricePerOutputTokenUsd,
					},
				}}
				onSubmit={(values: FormValues) => {
					updateModel.mutate({
						modelId: model.id,
						input: {
							isActive,
							pricePerInputTokenUsd: values.pricePerInputTokenUsd,
							pricePerOutputTokenUsd: values.pricePerOutputTokenUsd,
						},
					});
				}}
			>
				{({ register, formState: { errors } }) => (
					<div className="space-y-4">
						{updateModel.isError && (
							<div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
								{updateModel.error?.message}
							</div>
						)}

						<div className="flex items-center gap-3">
							<Switch
								id={`model-active-${model.id}`}
								checked={isActive}
								onCheckedChange={setIsActive}
							/>
							<Label htmlFor={`model-active-${model.id}`}>Active</Label>
						</div>

						<Input
							label="Price per input token (USD)"
							type="number"
							id={`input-price-${model.id}`}
							registration={register('pricePerInputTokenUsd')}
							error={errors.pricePerInputTokenUsd}
						/>

						<Input
							label="Price per output token (USD)"
							type="number"
							id={`output-price-${model.id}`}
							registration={register('pricePerOutputTokenUsd')}
							error={errors.pricePerOutputTokenUsd}
						/>
					</div>
				)}
			</Form>
		</FormDrawer>
	);
};
