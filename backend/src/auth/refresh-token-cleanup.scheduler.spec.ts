import { RefreshTokenCleanupScheduler } from './refresh-token-cleanup.scheduler';
import { createPrismaMock } from '../prisma/prisma.service.mock';

describe('RefreshTokenCleanupScheduler', () => {
  it('should delete only expired refresh tokens', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-18T03:00:00Z'));
    const prismaMock = createPrismaMock();
    prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 3 });
    const scheduler = new RefreshTokenCleanupScheduler(prismaMock);

    await scheduler.removeExpiredTokens();

    expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { expiresAt: { lt: new Date('2026-10-18T03:00:00Z') } },
    });
    jest.useRealTimers();
  });
});
