import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import { makeLocalServices } from '@/adapters/local/local-services';
import { AppServicesProvider } from '@/services/app-services-provider';

import { LimitsForm } from '../limits-form';

const renderForm = () => {
	const services = makeLocalServices({ scenario: 'admin-user' });
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return render(
		<MemoryRouter>
			<AppServicesProvider value={services}>
				<QueryClientProvider client={queryClient}>
					<LimitsForm />
				</QueryClientProvider>
			</AppServicesProvider>
		</MemoryRouter>,
	);
};

describe('LimitsForm', () => {
	it('loads and displays the current global limit', async () => {
		renderForm();
		await waitFor(() => {
			const input = screen.getByLabelText(/global weekly limit/i) as HTMLInputElement;
			expect(input.value).toBe('100');
		});
	});

	it('saves updated limit on submit', async () => {
		renderForm();
		await waitFor(() => screen.getByLabelText(/global weekly limit/i));

		const input = screen.getByLabelText(/global weekly limit/i);
		await userEvent.clear(input);
		await userEvent.type(input, '200');
		await userEvent.click(screen.getByRole('button', { name: /save/i }));

		await waitFor(() => {
			const updated = screen.getByLabelText(/global weekly limit/i) as HTMLInputElement;
			expect(updated.value).toBe('200');
		});
	});
});
