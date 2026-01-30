import { PrismaClient } from '@/generated/prisma';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with MariaDB adapter (compatible with MySQL)
function createPrismaClient(): PrismaClient {
  const connectionUrl = process.env.DATABASE_URL;

  if (!connectionUrl) {
    throw new Error('[PRISMA] DATABASE_URL not configured');
  }

  // Parse connection URL
  const url = new URL(connectionUrl);
  const host = url.hostname;
  const port = parseInt(url.port) || 3306;
  const user = url.username;
  const password = url.password;
  const database = url.pathname.slice(1); // Remove leading /

  // Create adapter with pool config
  const adapter = new PrismaMariaDb({
    host,
    port,
    user,
    password,
    database,
    connectionLimit: 5,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
