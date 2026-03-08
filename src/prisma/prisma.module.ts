import { Global, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createPrismaClient, PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: PrismaClient,
      useFactory: createPrismaClient,
    },
    PrismaService,
  ],
  exports: [PrismaService],
})
export class PrismaModule {}