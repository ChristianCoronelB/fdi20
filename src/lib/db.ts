import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// For Prisma 7.x with SQLite
const dbPath = process.env.DATABASE_URL || 'file:./prisma/db'

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: dbPath,
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
