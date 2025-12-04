/**
 * IpruBudgetX - Database Abstraction Layer
 *
 * Multi-database support via Prisma ORM.
 * This module provides the getDB() function that all services must use.
 *
 * IMPORTANT: All database access MUST go through getDB()
 * - NO hardcoded database logic
 * - Supports PostgreSQL, MySQL, SQL Server, SQLite
 * - Zero-code database switching
 *
 * @see DB_SWITCHING_GUIDE.md for switching instructions
 */

import { PrismaClient } from '@prisma/client';
import { dbConfig } from './config';

let prismaInstance: PrismaClient | null = null;

/**
 * Get database client instance (singleton pattern)
 *
 * This is the ONLY way to access the database in IpruBudgetX.
 * All services use this function to ensure database switching works seamlessly.
 *
 * @returns PrismaClient instance configured for current database provider
 *
 * @example
 * import { getDB } from './db';
 * const prisma = getDB();
 * const users = await prisma.user.findMany();
 */
export function getDB(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: dbConfig.url
        }
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
    });

    console.log('[IpruBudgetX] Database client initialized successfully');
  }

  return prismaInstance;
}

/**
 * Disconnect database client
 * Call this during application shutdown to close connections gracefully
 */
export async function disconnectDB(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
    console.log('[IpruBudgetX] Database client disconnected');
  }
}

export { PrismaClient };
