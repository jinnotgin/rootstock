import { env } from '@/config/env';

export type RuntimeMode = 'local' | 'dev' | 'staging' | 'production';
export type CapabilityMode = 'local' | 'api';
export type LocalScenario = 'empty' | 'logged-out' | 'normal-user' | 'admin-user' | 'pending-user' | 'at-limit';

export type RuntimeConfig = {
	runtimeMode: RuntimeMode;
	dataCapability: CapabilityMode;
	authCapability: CapabilityMode;
	localScenario: LocalScenario;
};

export const getRuntimeConfig = (): RuntimeConfig => {
	const runtimeMode = env.RUNTIME_MODE;
	const defaultCapability: CapabilityMode =
		import.meta.env.TEST ? 'api' : runtimeMode === 'local' ? 'local' : 'api';

	return {
		runtimeMode,
		dataCapability: env.DATA_CAPABILITY ?? defaultCapability,
		authCapability: env.AUTH_CAPABILITY ?? defaultCapability,
		localScenario: env.LOCAL_SCENARIO,
	};
};
