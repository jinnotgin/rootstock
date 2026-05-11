import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Spinner } from '@/components/ui/spinner';
import { useAdminUsers, useDeleteUser } from '@/lib/admin';
import { User } from '@/types/api';
import { AddUserDrawer } from './add-user-drawer';
import { EditUserDrawer } from './edit-user-drawer';

const DeleteUserButton = ({ user }: { user: User }) => {
	const deleteUser = useDeleteUser();
	return (
		<ConfirmationDialog
			title={`Delete ${user.email}?`}
			body="This will permanently remove the user and revoke their API key."
			icon="danger"
			isDone={deleteUser.isSuccess}
			triggerButton={
				<Button variant="destructive" size="sm" aria-label={`Delete ${user.email}`}>
					Delete
				</Button>
			}
			confirmButton={
				<Button
					variant="destructive"
					size="sm"
					onClick={() => deleteUser.mutate(user.id)}
					disabled={deleteUser.isPending}
				>
					{deleteUser.isPending ? 'Deleting…' : 'Yes, delete'}
				</Button>
			}
		/>
	);
};

export const UsersTable = () => {
	const { data: users, isLoading } = useAdminUsers();

	if (isLoading) {
		return (
			<div className="flex items-center gap-2 text-muted-foreground">
				<Spinner size="sm" />
				<span>Loading users…</span>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Users</h2>
				<AddUserDrawer />
			</div>

			<div className="rounded-md border">
				<table className="w-full text-sm">
					<thead className="border-b bg-muted/50">
						<tr>
							<th className="px-4 py-3 text-left font-medium">Email</th>
							<th className="px-4 py-3 text-left font-medium">Role</th>
							<th className="px-4 py-3 text-left font-medium">Status</th>
							<th className="px-4 py-3 text-left font-medium">Limit</th>
							<th className="px-4 py-3 text-right font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{users?.map((user) => (
							<tr key={user.id} className="border-b last:border-0">
								<td className="px-4 py-3">{user.email}</td>
								<td className="px-4 py-3">
									<Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
										{user.role}
									</Badge>
								</td>
								<td className="px-4 py-3">
									<Badge variant={user.status === 'active' ? 'outline' : 'secondary'}>
										{user.status}
									</Badge>
								</td>
								<td className="px-4 py-3">
									{user.customLimitUsd != null ? `$${user.customLimitUsd}` : 'Global'}
								</td>
								<td className="px-4 py-3">
									<div className="flex justify-end gap-2">
										<EditUserDrawer user={user} />
										<DeleteUserButton user={user} />
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};
