/**
 * IPruBudEx - Prisma Database Client
 *
 * This module exports a singleton Prisma Client instance for database operations.
 * The client automatically connects to the database specified in DATABASE_URL
 * environment variable and uses the provider specified in DB_PROVIDER.
 *
 * Supported providers: postgresql, mysql, sqlserver, sqlite
 *
 * Usage:
 *   import { prisma } from './db/prismaClient';
 *   const users = await prisma.user.findMany();
 */

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
