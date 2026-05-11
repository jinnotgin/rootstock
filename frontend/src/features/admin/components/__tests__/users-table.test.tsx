import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import { makeLocalServices } from '@/adapters/local/local-services';
import { AppServicesProvider } from '@/services/app-services-provider';

import { UsersTable } from '../users-table';

const renderTable = () => {
	const services = makeLocalServices({ scenario: 'admin-user' });
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return render(
		<MemoryRouter>
			<AppServicesProvider value={services}>
				<QueryClientProvider client={queryClient}>
					<UsersTable />
				</QueryClientProvider>
			</AppServicesProvider>
		</MemoryRouter>,
	);
};

describe('UsersTable', () => {
	it('lists all users', async () => {
		renderTable();
		await waitFor(() => {
			expect(screen.getByText('admin@example.com')).toBeInTheDocument();
			expect(screen.getByText('user@example.com')).toBeInTheDocument();
		});
	});

	it('shows user role badges', async () => {
		renderTable();
		await waitFor(() => {
			expect(screen.getByText('ADMIN')).toBeInTheDocument();
			expect(screen.getAllByText('USER').length).toBeGreaterThan(0);
		});
	});

	it('shows an Add User button', async () => {
		renderTable();
		await waitFor(() =>
			expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument(),
		);
	});

	it('can delete a user via confirm dialog', async () => {
		renderTable();
		await waitFor(() => expect(screen.getByText('user@example.com')).toBeInTheDocument());

		// Click the delete button for the normal user row (index 1, after admin)
		const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
		await userEvent.click(deleteButtons[1]);

		// Confirm dialog appears
		const confirmBtn = await screen.findByRole('button', { name: /yes, delete/i });
		await userEvent.click(confirmBtn);

		// User is removed from the table
		await waitFor(() =>
			expect(screen.queryByText('user@example.com')).not.toBeInTheDocument(),
		);
	});
});
