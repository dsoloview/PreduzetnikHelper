import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(config: ConfigService) {
    const url = config.getOrThrow<string>('DATABASE_URL');
    const pool = new Pool({ connectionString: url });
    super({ adapter: new PrismaPg(pool) });
    this.pool = pool;
  }

  /** The pg pool is ours, not Prisma's: close it on shutdown so connections are released */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    await this.pool.end();
  }
}
