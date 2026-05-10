export const env = {
  ENABLE_API_MOCKING: import.meta.env.VITE_ENABLE_API_MOCKING === 'true',
  RUNTIME_MODE: (import.meta.env.VITE_RUNTIME_MODE ?? 'local') as
    | 'local'
    | 'dev'
    | 'production',
} as const;
