import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import { makeLocalServices } from '@/adapters/local/local-services';
import { AppServicesProvider } from '@/services/app-services-provider';

import { ModelsTable } from '../models-table';

const renderTable = () => {
	const services = makeLocalServices({ scenario: 'admin-user' });
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return render(
		<MemoryRouter>
			<AppServicesProvider value={services}>
				<QueryClientProvider client={queryClient}>
					<ModelsTable />
				</QueryClientProvider>
			</AppServicesProvider>
		</MemoryRouter>,
	);
};

describe('ModelsTable', () => {
	it('lists all models', async () => {
		renderTable();
		await waitFor(() => {
			expect(screen.getByText(/claude-opus/i)).toBeInTheDocument();
			expect(screen.getByText(/claude-sonnet/i)).toBeInTheDocument();
			expect(screen.getByText(/gemini-flash/i)).toBeInTheDocument();
		});
	});

	it('shows active status for each model', async () => {
		renderTable();
		await waitFor(() => {
			const activeLabels = screen.getAllByText(/active/i);
			expect(activeLabels.length).toBeGreaterThan(0);
		});
	});

	it('has an edit button for each model', async () => {
		renderTable();
		await waitFor(() => {
			const editButtons = screen.getAllByRole('button', { name: /edit/i });
			expect(editButtons.length).toBe(3);
		});
	});
});
