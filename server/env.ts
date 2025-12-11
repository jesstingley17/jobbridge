/**
 * Environment variable validation utilities
 */

/**
 * Check if an environment variable is set
 */
export function hasEnv(key: string): boolean {
  return process.env[key] !== undefined && process.env[key] !== '';
}

/**
 * Ensure all required environment variables are set, throw if missing
 */
export function ensureEnvOrThrow(keys: string[]): void {
  const missing = keys.filter(key => !hasEnv(key));
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Warn if environment variables are missing (but don't throw)
 */
export function ensureEnvWarn(keys: string[]): void {
  const missing = keys.filter(key => !hasEnv(key));
  if (missing.length > 0) {
    console.warn(`Missing environment variables (will use defaults if available): ${missing.join(', ')}`);
  }
}

/**
 * Get an environment variable with optional default
 */
export function getEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}
