/**
 * IpruBudgetX - Database Configuration
 *
 * Multi-database configuration loader.
 * Reads DB_PROVIDER and DATABASE_URL from environment variables.
 *
 * Supported DB_PROVIDER values:
 * - postgresql (default)
 * - mysql
 * - sqlserver
 * - sqlite
 */

import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export interface DatabaseConfig {
  provider: string;
  url: string;
}

/**
 * Get database configuration from environment variables
 * @returns DatabaseConfig object with provider and url
 * @throws Error if DATABASE_URL is not set
 */
export function getDatabaseConfig(): DatabaseConfig {
  const provider = process.env.DB_PROVIDER || 'postgresql';
  const url = process.env.DATABASE_URL || '';

  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please configure DB_PROVIDER and DATABASE_URL in .env file. ' +
      'See DB_SWITCHING_GUIDE.md for instructions.'
    );
  }

  // Log current database configuration (safe - no credentials)
  console.log(`[IpruBudgetX] Database Provider: ${provider}`);

  return {
    provider,
    url
  };
}

export const dbConfig = getDatabaseConfig();
