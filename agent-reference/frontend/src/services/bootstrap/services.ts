import { makeApiServices } from '@/adapters/http/api-services';
import { makeLocalServices } from '@/adapters/local/local-services';
import { AppServices } from '@/services/app-services-provider';

import { getRuntimeConfig, RuntimeConfig } from './mode';

export const makeServices = (config: RuntimeConfig): AppServices => {
  const apiServices = makeApiServices();
  const localServices = makeLocalServices({ scenario: config.localScenario });

  return {
    auth:
      config.authCapability === 'local' ? localServices.auth : apiServices.auth,
    teams:
      config.dataCapability === 'local'
        ? localServices.teams
        : apiServices.teams,
    users:
      config.dataCapability === 'local'
        ? localServices.users
        : apiServices.users,
    discussions:
      config.dataCapability === 'local'
        ? localServices.discussions
        : apiServices.discussions,
    comments:
      config.dataCapability === 'local'
        ? localServices.comments
        : apiServices.comments,
    flags: localServices.flags,
    monitor:
      config.runtimeMode === 'production'
        ? apiServices.monitor
        : localServices.monitor,
  };
};

export const defaultServices = makeServices(getRuntimeConfig());
