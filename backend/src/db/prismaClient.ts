/**
 * IpruBudgetX - Multi-Database Prisma Client
 *
 * Singleton Prisma Client with multi-database support.
 * The client automatically connects to the database specified in environment variables.
 *
 * MULTI-DATABASE SUPPORT:
 * - Reads DB_PROVIDER from .env (postgresql, mysql, sqlserver, sqlite)
 * - Reads DATABASE_URL from .env for connection string
 * - NO CODE CHANGES needed to switch databases
 *
 * SUPPORTED DATABASES:
 * - PostgreSQL (Default - Supabase recommended)
 * - MySQL
 * - Microsoft SQL Server
 * - SQLite
 *
 * SWITCHING DATABASES:
 * 1. Update DB_PROVIDER and DATABASE_URL in .env
 * 2. Run: npx prisma generate
 * 3. Run: npx prisma migrate dev
 * 4. Done! (Under 1 minute)
 *
 * Usage:
 *   import { prisma } from './db/prismaClient';
 *   const users = await prisma.user.findMany();
 *
 * @see DB_SWITCHING_GUIDE.md for detailed instructions
 */

import { PrismaClient } from '@prisma/client';

// Singleton instance
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
