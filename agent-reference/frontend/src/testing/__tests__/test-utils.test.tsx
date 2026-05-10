import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useServices } from '@/services/app-services-provider';
import { makeTestServices } from '@/testing/adapters/make-test-services';

import { renderApp } from '../test-utils';

const Probe = () => {
  const { flags } = useServices();

  return <div>{flags.isEnabled('probe-flag') ? 'enabled' : 'disabled'}</div>;
};

describe('renderApp', () => {
  it('can inject port-level test adapters through the app provider', async () => {
    const isEnabled = vi.fn(() => true);
    const services = makeTestServices({
      flags: { isEnabled },
    });

    await renderApp(<Probe />, { services, user: null });

    expect(screen.getByText('enabled')).toBeInTheDocument();
    expect(isEnabled).toHaveBeenCalledWith('probe-flag');
  });
});
