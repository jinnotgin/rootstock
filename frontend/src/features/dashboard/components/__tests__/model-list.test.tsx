import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import { makeLocalServices } from '@/adapters/local/local-services';
import { LocalScenario } from '@/adapters/local/local-scenarios';
import { AppServicesProvider } from '@/services/app-services-provider';

import { ModelList } from '../model-list';

const USER_ID = 'user-normal';

const renderList = (scenario: LocalScenario = 'normal-user') => {
	const services = makeLocalServices({ scenario });
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return render(
		<MemoryRouter>
			<AppServicesProvider value={services}>
				<QueryClientProvider client={queryClient}>
					<ModelList userId={USER_ID} />
				</QueryClientProvider>
			</AppServicesProvider>
		</MemoryRouter>,
	);
};

describe('ModelList', () => {
	it('shows the models available to the user', async () => {
		renderList();
		// normal-user has model-sonnet and model-gemini
		await waitFor(() => {
			expect(screen.getByText(/claude-sonnet/i)).toBeInTheDocument();
			expect(screen.getByText(/gemini-flash/i)).toBeInTheDocument();
		});
	});

	it('does not show models the user does not have access to', async () => {
		renderList();
		await waitFor(() => expect(screen.getByText(/claude-sonnet/i)).toBeInTheDocument());
		expect(screen.queryByText(/claude-opus/i)).not.toBeInTheDocument();
	});
});
