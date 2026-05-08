import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaService } from './prisma.service';

export const createPrismaMock = (): DeepMockProxy<PrismaClient> => {
  return mockDeep<PrismaClient>();
};

// We create a mock provider to inject easily in TestingModules
export const prismaMockProvider = {
  provide: PrismaService,
  useValue: createPrismaMock(),
};
