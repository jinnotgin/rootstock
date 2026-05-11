import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, Input } from '@/components/ui/app-form';
import { Spinner } from '@/components/ui/spinner';
import { useGlobalLimits, useUpdateGlobalLimits } from '@/lib/admin';

const schema = z.object({
	globalWeeklyLimitUsd: z.coerce.number().min(0, 'Must be ≥ 0'),
});

type FormValues = z.infer<typeof schema>;

export const LimitsForm = () => {
	const { data: limits, isLoading } = useGlobalLimits();
	const updateLimits = useUpdateGlobalLimits();

	if (isLoading) {
		return (
			<div className="flex items-center gap-2 text-muted-foreground">
				<Spinner size="sm" />
				<span>Loading limits…</span>
			</div>
		);
	}

	return (
		<Card className="max-w-md">
			<CardHeader>
				<CardTitle>Global Spend Limits</CardTitle>
			</CardHeader>
			<CardContent>
				<Form
					schema={schema}
					options={{ defaultValues: { globalWeeklyLimitUsd: limits?.globalWeeklyLimitUsd ?? 100 } }}
					onSubmit={(values: FormValues) => {
						updateLimits.mutate({ globalWeeklyLimitUsd: values.globalWeeklyLimitUsd });
					}}
				>
					{({ register, formState: { errors } }) => (
						<div className="space-y-4">
							{updateLimits.isError && (
								<div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
									{updateLimits.error?.message}
								</div>
							)}

							{updateLimits.isSuccess && (
								<div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
									Limits saved.
								</div>
							)}

							<Input
								label="Global weekly limit ($)"
								type="number"
								id="global-weekly-limit"
								registration={register('globalWeeklyLimitUsd')}
								error={errors.globalWeeklyLimitUsd}
							/>

							<Button type="submit" disabled={updateLimits.isPending}>
								{updateLimits.isPending ? 'Saving…' : 'Save'}
							</Button>
						</div>
					)}
				</Form>
			</CardContent>
		</Card>
	);
};
