import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import { makeLocalServices } from '@/adapters/local/local-services';
import { LocalScenario } from '@/adapters/local/local-scenarios';
import { AppServicesProvider } from '@/services/app-services-provider';

import { UsageSummaryCard } from '../usage-summary';

const USER_ID = 'user-normal';

const renderCard = (scenario: LocalScenario = 'normal-user') => {
	const services = makeLocalServices({ scenario });
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return render(
		<MemoryRouter>
			<AppServicesProvider value={services}>
				<QueryClientProvider client={queryClient}>
<UsageSummaryCard userId={USER_ID} limitUsd={20} />
			</QueryClientProvider>
		</AppServicesProvider>
	</MemoryRouter>,
);
};

describe('UsageSummaryCard', () => {
	it('shows weekly cost in dollars', async () => {
		renderCard();
		await waitFor(() => expect(screen.getByText(/\$7\.20/)).toBeInTheDocument());
	});

	it('shows a progress bar', async () => {
		renderCard();
		await waitFor(() => expect(screen.getByRole('progressbar')).toBeInTheDocument());
	});

	it('shows the limit', async () => {
		renderCard();
		// limitUsd passed as 20
		await waitFor(() => expect(screen.getByText(/\$20/)).toBeInTheDocument());
	});

	it('shows full progress bar when at limit', async () => {
		const services = makeLocalServices({ scenario: 'at-limit' });
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		render(
			<MemoryRouter>
				<AppServicesProvider value={services}>
					<QueryClientProvider client={queryClient}>
						<UsageSummaryCard userId={USER_ID} limitUsd={20} />
					</QueryClientProvider>
				</AppServicesProvider>
			</MemoryRouter>,
		);
		await waitFor(() => {
			const bar = screen.getByRole('progressbar');
			expect(bar).toHaveAttribute('aria-valuenow', '100');
		});
	});
});
