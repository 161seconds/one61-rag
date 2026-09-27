import { CacheService } from '@aqua-calendar/infra-redis';
import { PrismaService } from '../prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProcessorPreference {
  constructor(
    private readonly cacheService: CacheService,
    private readonly prismaService: PrismaService,
  ) {}

  apply() {}
}
