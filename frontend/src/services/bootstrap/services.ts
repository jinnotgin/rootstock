import { HttpGatewayAdapter } from '@/adapters/http/gateway-adapter';
import { makeLocalServices } from '@/adapters/local/local-services';
import { AppServices } from '@/services/app-services-provider';

export const makeServices = (): AppServices => {
  const local = makeLocalServices();
  return {
    auth: local.auth,
    users: local.users,
    gateway: new HttpGatewayAdapter(),
    settings: local.settings,
  };
};

export const defaultServices = makeServices();
