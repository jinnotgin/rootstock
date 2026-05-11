import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import { makeLocalServices } from '@/adapters/local/local-services';
import { LocalScenario } from '@/adapters/local/local-scenarios';
import { AppServicesProvider } from '@/services/app-services-provider';

import { SetPasswordForm } from '../set-password-form';

const renderSetPasswordForm = (
	email = 'newuser@example.com',
	onSuccess = vi.fn(),
	scenario: LocalScenario = 'pending-user',
) => {
	const services = makeLocalServices({ scenario });
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return render(
		<MemoryRouter>
			<AppServicesProvider value={services}>
				<QueryClientProvider client={queryClient}>
					<SetPasswordForm email={email} onSuccess={onSuccess} />
				</QueryClientProvider>
			</AppServicesProvider>
		</MemoryRouter>,
	);
};

describe('SetPasswordForm', () => {
	it('renders password and confirm-password fields and a submit button', () => {
		renderSetPasswordForm();
		expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /set password/i })).toBeInTheDocument();
	});

	it('shows a validation error when password is too short', async () => {
		renderSetPasswordForm();
		await userEvent.type(screen.getByLabelText(/^password$/i), 'short');
		await userEvent.type(screen.getByLabelText(/confirm password/i), 'short');
		await userEvent.click(screen.getByRole('button', { name: /set password/i }));
		expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
	});

	it('shows a validation error when passwords do not match', async () => {
		renderSetPasswordForm();
		await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
		await userEvent.type(screen.getByLabelText(/confirm password/i), 'different123');
		await userEvent.click(screen.getByRole('button', { name: /set password/i }));
		expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
	});

	it('calls onSuccess after successfully setting a password', async () => {
		const onSuccess = vi.fn();
		renderSetPasswordForm('newuser@example.com', onSuccess, 'pending-user');

		await userEvent.type(screen.getByLabelText(/^password$/i), 'newpassword1');
		await userEvent.type(screen.getByLabelText(/confirm password/i), 'newpassword1');
		await userEvent.click(screen.getByRole('button', { name: /set password/i }));

		expect(await vi.waitFor(() => onSuccess)).toHaveBeenCalledOnce();
	});
});
