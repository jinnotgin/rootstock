import '@testing-library/jest-dom/vitest';

beforeEach(() => {
	vi.stubGlobal(
		'ResizeObserver',
		vi.fn(() => ({ observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() })),
	);

	window.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
	window.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');

	vi.stubGlobal('indexedDB', undefined);
	localStorage.clear();
});

afterEach(() => {
	vi.restoreAllMocks();
});
