import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import { makeLocalServices } from '@/adapters/local/local-services';
import { LocalScenario } from '@/adapters/local/local-scenarios';
import { AppServicesProvider } from '@/services/app-services-provider';

import { ApiKeyCard } from '../api-key-card';

const USER_ID = 'user-normal';

const renderCard = (scenario: LocalScenario = 'normal-user') => {
	const services = makeLocalServices({ scenario });
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return render(
		<MemoryRouter>
			<AppServicesProvider value={services}>
				<QueryClientProvider client={queryClient}>
					<ApiKeyCard userId={USER_ID} />
				</QueryClientProvider>
			</AppServicesProvider>
		</MemoryRouter>,
	);
};

describe('ApiKeyCard', () => {
	it('shows masked key by default', async () => {
		renderCard();
		await waitFor(() => expect(screen.getByText(/••••/)).toBeInTheDocument());
		expect(screen.queryByText(/sk-gateway/)).not.toBeInTheDocument();
	});

	it('reveals the key when the toggle button is clicked', async () => {
		renderCard();
		await waitFor(() => expect(screen.getByText(/••••/)).toBeInTheDocument());
		await userEvent.click(screen.getByRole('button', { name: /show/i }));
		expect(await screen.findByText(/sk-gateway/)).toBeInTheDocument();
	});

	it('hides the key again when toggled a second time', async () => {
		renderCard();
		await waitFor(() => expect(screen.getByText(/••••/)).toBeInTheDocument());
		await userEvent.click(screen.getByRole('button', { name: /show/i }));
		await screen.findByText(/sk-gateway/);
		await userEvent.click(screen.getByRole('button', { name: /hide/i }));
		expect(await screen.findByText(/••••/)).toBeInTheDocument();
	});

	it('has a copy button', async () => {
		renderCard();
		await waitFor(() => expect(screen.getByText(/••••/)).toBeInTheDocument());
		expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
	});

	it('has a rotate button', async () => {
		renderCard();
		await waitFor(() => expect(screen.getByText(/••••/)).toBeInTheDocument());
		expect(screen.getByRole('button', { name: /rotate/i })).toBeInTheDocument();
	});
});
