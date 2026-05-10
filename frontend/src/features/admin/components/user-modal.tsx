import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { ALL_MODELS, ModelSlug, User } from '@/domain/types';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const createSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  assignedModels: z.array(z.string()).min(1, 'Assign at least one model'),
  customWeeklyLimit: z.string().optional(),
});

const editSchema = z.object({
  assignedModels: z.array(z.string()).min(1, 'Assign at least one model'),
  customWeeklyLimit: z.string().optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

type UserModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmitCreate: (data: {
    email: string;
    password: string;
    assignedModels: ModelSlug[];
    customWeeklyLimit: number | null;
  }) => Promise<void>;
  onSubmitEdit: (data: {
    assignedModels: ModelSlug[];
    customWeeklyLimit: number | null;
  }) => Promise<void>;
  editingUser: User | null;
  loading?: boolean;
};

export function UserModal({
  open,
  onClose,
  onSubmitCreate,
  onSubmitEdit,
  editingUser,
  loading,
}: UserModalProps) {
  const isEdit = !!editingUser;

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { email: '', password: '', assignedModels: [], customWeeklyLimit: '' },
  });

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      assignedModels: editingUser?.assignedModels ?? [],
      customWeeklyLimit: editingUser?.customWeeklyLimit?.toString() ?? '',
    },
  });

  useEffect(() => {
    if (editingUser) {
      editForm.reset({
        assignedModels: editingUser.assignedModels,
        customWeeklyLimit: editingUser.customWeeklyLimit?.toString() ?? '',
      });
    } else {
      createForm.reset({ email: '', password: '', assignedModels: [], customWeeklyLimit: '' });
    }
  }, [editingUser, editForm, createForm]);

  const parseLimit = (val?: string): number | null => {
    if (!val || val.trim() === '') return null;
    const n = parseInt(val, 10);
    return isNaN(n) ? null : n;
  };

  const handleCreate = createForm.handleSubmit(async (values) => {
    await onSubmitCreate({
      email: values.email,
      password: values.password,
      assignedModels: values.assignedModels as ModelSlug[],
      customWeeklyLimit: parseLimit(values.customWeeklyLimit),
    });
  });

  const handleEdit = editForm.handleSubmit(async (values) => {
    await onSubmitEdit({
      assignedModels: values.assignedModels as ModelSlug[],
      customWeeklyLimit: parseLimit(values.customWeeklyLimit),
    });
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${editingUser?.email}` : 'Add User'}
    >
      {!isEdit ? (
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            error={createForm.formState.errors.email?.message}
            {...createForm.register('email')}
          />
          <Input
            label="Password"
            type="password"
            error={createForm.formState.errors.password?.message}
            {...createForm.register('password')}
          />
          <ModelSelector
            control={createForm.control}
            error={createForm.formState.errors.assignedModels?.message}
          />
          <Input
            label="Custom weekly request limit (leave blank for global default)"
            type="number"
            placeholder="e.g. 500"
            {...createForm.register('customWeeklyLimit')}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Add User
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleEdit} className="flex flex-col gap-4">
          <ModelSelector
            control={editForm.control}
            error={editForm.formState.errors.assignedModels?.message}
          />
          <Input
            label="Custom weekly request limit (leave blank for global default)"
            type="number"
            placeholder="e.g. 500"
            {...editForm.register('customWeeklyLimit')}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

function ModelSelector({
  control,
  error,
}: {
  control: any;
  error?: string;
}) {
  return (
    <Controller
      name="assignedModels"
      control={control}
      render={({ field }) => (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Assigned Models</span>
          <div className="flex flex-col gap-2 rounded-md border border-gray-200 p-3">
            {ALL_MODELS.map((model) => {
              const checked = (field.value as string[]).includes(model.slug);
              return (
                <label key={model.slug} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...field.value, model.slug]
                        : field.value.filter((s: string) => s !== model.slug);
                      field.onChange(next);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                  />
                  <span className="text-sm text-gray-700">{model.name}</span>
                </label>
              );
            })}
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    />
  );
}
