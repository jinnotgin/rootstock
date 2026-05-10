import { makeLocalServices } from '@/adapters/local/local-services';
import { AppServices } from '@/services/app-services-provider';

import { getRuntimeConfig } from './mode';

const config = getRuntimeConfig();

export const defaultServices: AppServices = makeLocalServices({ scenario: config.localScenario });
