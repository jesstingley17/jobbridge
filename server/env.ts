export function listMissingEnv(required: string[]) {
  const missing: string[] = [];
  for (const key of required) {
    const val = process.env[key];
    if (!val || val === '' || val?.startsWith('replace_with') || val?.includes('your_')) {
      missing.push(key);
    }
  }
  return missing;
}

export function ensureEnvOrThrow(required: string[]) {
  const missing = listMissingEnv(required);
  if (missing.length > 0) {
    const msg = `Missing required environment variables: ${missing.join(', ')}`;
    throw new Error(msg);
  }
}

export function ensureEnvWarn(required: string[]) {
  const missing = listMissingEnv(required);
  if (missing.length > 0) {
    console.warn(`Warning: missing environment variables: ${missing.join(', ')}`);
  }
}

export default { listMissingEnv, ensureEnvOrThrow, ensureEnvWarn };
