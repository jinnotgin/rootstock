import { render as rtlRender, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router';

import { makeTestServices } from './adapters/make-test-services';

import { AppProvider } from '@/app/provider';
import { AppServices } from '@/services/app-services-provider';

export const waitForLoadingToFinish = () =>
	waitForElementToBeRemoved(
		() => [...screen.queryAllByTestId(/loading/i), ...screen.queryAllByText(/loading/i)],
		{ timeout: 4000 },
	);

export const renderApp = async (
	ui: React.ReactElement,
	{
		url = '/',
		path = '/',
		services,
		...renderOptions
	}: { url?: string; path?: string; services?: AppServices } & Record<string, any> = {},
) => {
	const resolvedServices = services ?? makeTestServices();

	const router = createMemoryRouter(
		[{ path, element: ui }],
		{ initialEntries: ['/', url], initialIndex: url !== '/' ? 1 : 0 },
	);

	const result = rtlRender(ui, {
		wrapper: () => (
			<AppProvider services={resolvedServices}>
				<RouterProvider router={router} />
			</AppProvider>
		),
		...renderOptions,
	});

	await waitForLoadingToFinish().catch(() => {});

	return result;
};

export * from '@testing-library/react';
export { userEvent, rtlRender };
