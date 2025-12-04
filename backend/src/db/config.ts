import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export interface DatabaseConfig {
  provider: string;
  url: string;
}

export function getDatabaseConfig(): DatabaseConfig {
  const provider = process.env.DB_PROVIDER || 'postgresql';
  const url = process.env.DATABASE_URL || '';

  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  return {
    provider,
    url
  };
}

export const dbConfig = getDatabaseConfig();
