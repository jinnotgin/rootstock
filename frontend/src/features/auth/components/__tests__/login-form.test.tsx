import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import { makeLocalServices } from '@/adapters/local/local-services';
import { LocalScenario } from '@/adapters/local/local-scenarios';
import { AppServicesProvider } from '@/services/app-services-provider';

import { LoginForm } from '../login-form';

const renderLoginForm = (
	onSuccess = vi.fn(),
	onNeedsPassword = vi.fn(),
	scenario: LocalScenario = 'logged-out',
) => {
	const services = makeLocalServices({ scenario });
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return render(
		<MemoryRouter>
			<AppServicesProvider value={services}>
				<QueryClientProvider client={queryClient}>
					<LoginForm onSuccess={onSuccess} onNeedsPassword={onNeedsPassword} />
				</QueryClientProvider>
			</AppServicesProvider>
		</MemoryRouter>,
	);
};

describe('LoginForm', () => {
	it('renders email and password fields and a submit button', () => {
		renderLoginForm();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
	});

	it('shows validation errors when submitted empty', async () => {
		renderLoginForm();
		await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
		const errors = await screen.findAllByText(/required/i);
		expect(errors.length).toBeGreaterThan(0);
	});

	it('calls onSuccess after a successful login', async () => {
		const onSuccess = vi.fn();
		renderLoginForm(onSuccess, vi.fn(), 'logged-out');

		await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
		await userEvent.type(screen.getByLabelText(/password/i), 'password');
		await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

		expect(await vi.waitFor(() => onSuccess)).toHaveBeenCalledOnce();
	});

	it('calls onNeedsPassword with the email when the account has no password yet', async () => {
		const onNeedsPassword = vi.fn();
		renderLoginForm(vi.fn(), onNeedsPassword, 'pending-user');

		await userEvent.type(screen.getByLabelText(/email/i), 'newuser@example.com');
		await userEvent.type(screen.getByLabelText(/password/i), 'anything');
		await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

		expect(await vi.waitFor(() => onNeedsPassword)).toHaveBeenCalledWith('newuser@example.com');
	});

	it('shows an error when the email is not whitelisted', async () => {
		renderLoginForm(vi.fn(), vi.fn(), 'empty');

		await userEvent.type(screen.getByLabelText(/email/i), 'unknown@example.com');
		await userEvent.type(screen.getByLabelText(/password/i), 'anything');
		await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

		expect(await screen.findByRole('alert')).toBeInTheDocument();
	});
});
