import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';

import { AppServicesProvider } from '@/services/app-services-provider';
import { makeLocalServices } from '@/adapters/local/local-services';
import { HttpGatewayAdapter } from '@/adapters/http/gateway-adapter';
import { ApiKeyCard } from '../components/api-key-card';

const mockUser = {
  id: 'user-1',
  email: 'alice@example.com',
  role: 'user' as const,
  createdAt: '2026-01-10T00:00:00Z',
  keyId: 'key-1',
  assignedModels: ['claude-opus-4-6' as const],
  customWeeklyLimit: null,
};

vi.mock('@/lib/auth', () => ({
  useCurrentUser: () => mockUser,
  useAuth: () => ({ state: { status: 'authenticated', user: mockUser }, login: vi.fn(), logout: vi.fn() }),
}));

function makeTestServices() {
  const local = makeLocalServices();
  return { ...local, gateway: new HttpGatewayAdapter() };
}

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const services = makeTestServices();
  return (
    <QueryClientProvider client={qc}>
      <AppServicesProvider services={services}>
        {children}
      </AppServicesProvider>
    </QueryClientProvider>
  );
}

describe('ApiKeyCard', () => {
  it('shows the key masked by default', async () => {
    render(<ApiKeyCard />, { wrapper: Wrapper });
    // masked: first 7 chars + bullet chars, full value not visible
    await waitFor(() => {
      expect(screen.getByText(/sk-gw-a/)).toBeInTheDocument();
    });
    expect(screen.queryByText('sk-gw-alice-xxxxxxxxxxxxxxxx')).not.toBeInTheDocument();
  });

  it('reveals the key on toggle', async () => {
    render(<ApiKeyCard />, { wrapper: Wrapper });
    await waitFor(() => screen.getByLabelText('Reveal key'));
    fireEvent.click(screen.getByLabelText('Reveal key'));
    expect(screen.getByText('sk-gw-alice-xxxxxxxxxxxxxxxx')).toBeInTheDocument();
  });

  it('shows a confirm dialog when rotating', async () => {
    render(<ApiKeyCard />, { wrapper: Wrapper });
    await waitFor(() => screen.getByText(/Rotate key/i));
    fireEvent.click(screen.getByText(/Rotate key/i));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/will be invalidated/i)).toBeInTheDocument();
  });
});
