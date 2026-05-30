import { PrismaClient } from '../generated/prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaService } from './prisma.service';

export const createPrismaMock = (): DeepMockProxy<PrismaClient> => {
  return mockDeep<PrismaClient>();
};

export const prismaMockProvider = {
  provide: PrismaService,
  useValue: createPrismaMock(),
};
