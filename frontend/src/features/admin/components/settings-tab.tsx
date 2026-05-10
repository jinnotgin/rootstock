import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useSettings, useUpdateSettings } from '../api/use-admin';

const schema = z.object({
  weeklyRequestLimit: z
    .string()
    .min(1)
    .refine((v) => !isNaN(parseInt(v, 10)) && parseInt(v, 10) > 0, {
      message: 'Must be a positive number',
    }),
});
type FormValues = z.infer<typeof schema>;

export function SettingsTab() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { weeklyRequestLimit: '' },
  });

  useEffect(() => {
    if (settings) {
      reset({ weeklyRequestLimit: settings.weeklyRequestLimit.toString() });
    }
  }, [settings, reset]);

  const onSubmit = handleSubmit(async (values) => {
    await updateSettings.mutateAsync({
      weeklyRequestLimit: parseInt(values.weeklyRequestLimit, 10),
    });
    reset({ weeklyRequestLimit: values.weeklyRequestLimit });
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-900">Global Settings</h2>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Default Usage Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input
              label="Global weekly request limit"
              type="number"
              min={1}
              error={errors.weeklyRequestLimit?.message}
              {...register('weeklyRequestLimit')}
            />
            <p className="text-xs text-gray-500">
              Applied to all users without a custom limit.
            </p>
            {updateSettings.isSuccess && !isDirty && (
              <p className="text-xs text-green-600">Settings saved.</p>
            )}
            <div className="flex justify-end">
              <Button type="submit" loading={updateSettings.isPending} disabled={!isDirty}>
                Save
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
