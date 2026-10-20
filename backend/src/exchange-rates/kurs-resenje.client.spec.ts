import { KursResenjeClient } from './kurs-resenje.client';

const rate = (
  code: string,
  exchange_middle: number,
  parity = 1,
  date = '2026-10-16',
) => ({
  code,
  date,
  parity,
  exchange_middle,
  exchange_buy: exchange_middle - 0.3,
  exchange_sell: exchange_middle + 0.3,
});

describe('KursResenjeClient', () => {
  let client: KursResenjeClient;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    client = new KursResenjeClient();
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  /** Responds per currency, based on the requested URL */
  const respondWith = (
    byCurrency: Record<string, { status: number; body: unknown }>,
  ) => {
    fetchMock.mockImplementation(async (url: string) => {
      const code = url.match(/currencies\/(\w+)\//)![1];
      const { status, body } = byCurrency[code];
      return {
        ok: status < 400,
        status,
        text: async () =>
          typeof body === 'string' ? body : JSON.stringify(body),
      };
    });
  };

  it('requests EUR and USD for the date in Belgrade time', async () => {
    respondWith({
      eur: { status: 200, body: rate('EUR', 117.1726) },
      usd: { status: 200, body: rate('USD', 100.5432) },
    });

    // 23:30 UTC on Oct 15 is already Oct 16 in Belgrade
    await client.fetchRatesForDate(new Date('2026-10-15T23:30:00Z'));

    const urls = fetchMock.mock.calls.map(([url]) => url).sort();
    expect(urls).toEqual([
      'https://kurs.resenje.org/api/v1/currencies/eur/rates/2026-10-16',
      'https://kurs.resenje.org/api/v1/currencies/usd/rates/2026-10-16',
    ]);
  });

  it('returns middle rates per one unit of currency', async () => {
    respondWith({
      eur: { status: 200, body: rate('EUR', 117.1726) },
      usd: { status: 200, body: rate('USD', 10054.32, 100) },
    });

    const rates = await client.fetchRatesForDate(
      new Date('2026-10-16T10:00:00Z'),
    );

    expect(rates).toEqual([
      { currencyCode: 'EUR', middleRate: 117.1726 },
      { currencyCode: 'USD', middleRate: 100.5432 },
    ]);
  });

  it('returns an empty list when there is no rate list for the date', async () => {
    respondWith({
      eur: { status: 404, body: 'not found' },
      usd: { status: 404, body: 'not found' },
    });

    await expect(
      client.fetchRatesForDate(new Date('2026-10-17T10:00:00Z')),
    ).resolves.toEqual([]);
  });

  it('throws on server errors so the service can fall back to cached rates', async () => {
    respondWith({
      eur: { status: 503, body: 'down' },
      usd: { status: 200, body: rate('USD', 100.5432) },
    });

    await expect(client.fetchRatesForDate(new Date())).rejects.toThrow(
      'HTTP 503',
    );
  });

  it('throws when the response has no middle rate', async () => {
    respondWith({
      eur: { status: 200, body: { code: 'EUR' } },
      usd: { status: 200, body: rate('USD', 100.5432) },
    });

    await expect(client.fetchRatesForDate(new Date())).rejects.toThrow(
      'without a middle rate for EUR',
    );
  });
});
