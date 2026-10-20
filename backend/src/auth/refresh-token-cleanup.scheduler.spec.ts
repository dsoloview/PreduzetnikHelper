import { Logger } from '@nestjs/common';
import { RefreshTokenCleanupScheduler } from './refresh-token-cleanup.scheduler';
import { createPrismaMock } from '../prisma/prisma.service.mock';
import type { PrismaService } from '../prisma/prisma.service';

describe('RefreshTokenCleanupScheduler', () => {
  it('should delete only expired refresh tokens', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-18T03:00:00Z'));
    const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const prismaMock = createPrismaMock();
    prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 3 });
    const scheduler = new RefreshTokenCleanupScheduler(
      prismaMock as unknown as PrismaService,
    );

    await scheduler.removeExpiredTokens();

    expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { expiresAt: { lt: new Date('2026-10-18T03:00:00Z') } },
    });
    expect(log).toHaveBeenCalledWith('CRON: Removed 3 expired refresh tokens');
    log.mockRestore();
    jest.useRealTimers();
  });
});
