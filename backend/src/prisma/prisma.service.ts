import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private _systemSettings: any;
  public get systemSettings(): any {
    return this._systemSettings;
  }
  public set systemSettings(value: any) {
    this._systemSettings = value;
  }
  constructor() {
    const pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://postgres:deepak123@localhost:5432/careerforge',
    });
    const adapter = new PrismaPg(pool);

    super({ adapter } as any);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
