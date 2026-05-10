export interface FlagProvider {
	isEnabled(flag: string): boolean;
}

export interface Monitor {
	info(message: string, context?: Record<string, unknown>): void;
	error(error: unknown, context?: Record<string, unknown>): void;
}
