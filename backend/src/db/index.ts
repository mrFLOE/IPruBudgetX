import { PrismaClient } from '@prisma/client';
import { dbConfig } from './config';

let prismaInstance: PrismaClient | null = null;

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
  }

  return prismaInstance;
}

export async function disconnectDB(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}

export { PrismaClient };
