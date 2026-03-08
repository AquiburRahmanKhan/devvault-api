import { Inject, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env['DATABASE_URL'] ??
    (() => {
      throw new Error('DATABASE_URL is required');
    })();
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(PrismaClient) public readonly client: PrismaClient) {}

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}