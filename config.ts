import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const ConfigSchema = z.object({
  baseUrl: z.string().url(),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  headless: z.boolean(),
  slowMoMs: z.number().int().min(0),
});

export const mobileConfig = {
  baseUrl:
    process.env.MOBILE_BASE_URL ||
    process.env.PARABANK_BASE_URL ||
    process.env.API_BASE_URL?.replace(/\/services\/bank\/?$/, '') ||
    'https://parabank.parasoft.com/parabank',
  username: process.env.PARABANK_USER,
  password: process.env.PARABANK_PASS,
  headless: process.env.HEADLESS !== 'false',
  slowMoMs: Number.parseInt(process.env.MOBILE_SLOWMO_MS || process.env.PW_SLOWMO_MS || '0', 10),
} as const;

export const validatedMobileConfig = ConfigSchema.parse(mobileConfig);

export function getParabankCredentials(): { username: string; password: string } {
  const { username, password } = validatedMobileConfig;
  if (!username || !password) {
    throw new Error('PARABANK_USER and PARABANK_PASS are required for authenticated scenarios');
  }
  return { username, password };
}

export function redactSensitive(value: string): string {
  return value
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]')
    .replace(/\b\d{13,19}\b/g, '[PAN-REDACTED]')
    .replace(/\b\d{6,}\b/g, '[ACCOUNT-REDACTED]');
}
