import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'], // remove query logs in dev for speed
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}