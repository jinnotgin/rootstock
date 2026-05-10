import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

import { User } from '@/domain/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Spinner } from '@/components/ui/spinner';
import { ALL_MODELS } from '@/domain/types';
import { CreateUserInput, UpdateUserInput } from '@/ports/users';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useSettings,
} from '../api/use-admin';
import { UserModal } from './user-modal';

export function UsersTab() {
  const { data: users, isLoading } = useUsers();
  const { data: settings } = useSettings();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const nonAdminUsers = users?.filter((u) => u.role !== 'admin') ?? [];

  const handleCreate = async (input: CreateUserInput) => {
    await createUser.mutateAsync(input);
    setModalOpen(false);
  };

  const handleEdit = async (input: UpdateUserInput) => {
    if (!editingUser) return;
    await updateUser.mutateAsync({
      userId: editingUser.id,
      keyId: editingUser.keyId,
      input,
    });
    setEditingUser(null);
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    await deleteUser.mutateAsync({
      userId: deletingUser.id,
      keyId: deletingUser.keyId,
    });
    setDeletingUser(null);
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">
          Users ({nonAdminUsers.length})
        </h2>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> Add User
        </Button>
      </div>

      {nonAdminUsers.length === 0 && (
        <p className="text-sm text-gray-500">No users yet. Add one to get started.</p>
      )}

      {nonAdminUsers.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 font-medium text-gray-600">Models</th>
                <th className="px-4 py-3 font-medium text-gray-600">Weekly Limit</th>
                <th className="px-4 py-3 font-medium text-gray-600">Key ID</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {nonAdminUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{user.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.assignedModels.length === 0 ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        user.assignedModels.map((slug) => {
                          const model = ALL_MODELS.find((m) => m.slug === slug);
                          return (
                            <Badge key={slug} variant="info">
                              {model?.name ?? slug}
                            </Badge>
                          );
                        })
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {user.customWeeklyLimit != null
                      ? user.customWeeklyLimit.toLocaleString()
                      : `${settings?.weeklyRequestLimit.toLocaleString() ?? '—'} (global)`}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {user.keyId ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                        aria-label="Edit user"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingUser(user)}
                        aria-label="Delete user"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UserModal
        open={modalOpen || !!editingUser}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
        }}
        onSubmitCreate={handleCreate}
        onSubmitEdit={handleEdit}
        editingUser={editingUser}
        loading={createUser.isPending || updateUser.isPending}
      />

      <ConfirmDialog
        open={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
        title="Remove User"
        message={`Remove ${deletingUser?.email}? Their API key will be deleted and they will lose access immediately.`}
        confirmLabel="Remove"
        loading={deleteUser.isPending}
      />
    </div>
  );
}
