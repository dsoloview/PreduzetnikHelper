import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

/**
 * End-to-end tests against a real Postgres (see e2e-database.ts): migrations, transactions,
 * unique indexes and the HTTP pipeline (prefix, validation, cookies) are all the production ones.
 */
describe('API (e2e, real database)', () => {
  let app: NestExpressApplication;
  let http: App;

  const PASSWORD = 'Password123';
  let emailCounter = 0;

  const register = async () => {
    const email = `user${++emailCounter}-${Date.now()}@e2e.test`;
    const res = await request(http)
      .post('/api/auth/register')
      .send({ email, password: PASSWORD, name: 'E2E User' })
      .expect(201);
    const body = res.body as { accessToken: string };
    return {
      email,
      token: body.accessToken,
      cookie: [res.headers['set-cookie']].flat()[0] ?? '',
    };
  };

  const authed = (token: string) => ({
    get: (url: string) =>
      request(http).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string, body: object) =>
      request(http)
        .post(url)
        .set('Authorization', `Bearer ${token}`)
        .send(body),
    patch: (url: string, body: object) =>
      request(http)
        .patch(url)
        .set('Authorization', `Bearer ${token}`)
        .send(body),
    delete: (url: string) =>
      request(http).delete(url).set('Authorization', `Bearer ${token}`),
  });

  /** A user with one domestic client and one RSD bank account */
  const userWithClient = async () => {
    const user = await register();
    const api = authed(user.token);
    const client = await api
      .post('/api/clients', {
        type: 'DOMESTIC',
        name: 'Klijent d.o.o.',
        address: 'Knez Mihailova 1',
        city: 'Beograd',
        country: 'RS',
        taxId: '123456789',
        registrationNumber: '12345678',
      })
      .expect(201);
    const account = await api
      .post('/api/bank-accounts', {
        bankName: 'Banka',
        accountNumber: '160-0000000000001-11',
        currency: 'RSD',
      })
      .expect(201);
    const newInvoice = (overrides: object = {}) =>
      api.post('/api/invoices', {
        clientId: (client.body as { id: string }).id,
        bankAccountId: (account.body as { id: string }).id,
        issueDate: '2026-05-10',
        dueDate: '2026-05-25',
        items: [{ description: 'Usluga', quantity: 1, unitPrice: 100000 }],
        ...overrides,
      });
    return { ...user, api, newInvoice };
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
    http = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health', async () => {
    await request(http).get('/api/health').expect(200).expect({ status: 'ok' });
  });

  describe('auth', () => {
    it('sets an HttpOnly refresh cookie and rotates it on refresh', async () => {
      const { cookie } = await register();
      expect(cookie).toMatch(/^refreshToken=/);
      expect(cookie).toMatch(/HttpOnly/i);

      const refreshed = await request(http)
        .post('/api/auth/refresh')
        .set('Cookie', cookie)
        .expect(200);
      expect((refreshed.body as { accessToken: string }).accessToken).toEqual(
        expect.any(String),
      );

      // The old refresh token was consumed by the rotation
      await request(http)
        .post('/api/auth/refresh')
        .set('Cookie', cookie)
        .expect(401);
    });

    it('answers 401 alike for an unknown email and a wrong password', async () => {
      const { email } = await register();
      await request(http)
        .post('/api/auth/login')
        .send({ email: 'nobody@e2e.test', password: PASSWORD })
        .expect(401);
      await request(http)
        .post('/api/auth/login')
        .send({ email, password: 'Wrongpass1' })
        .expect(401);
    });

    it('rejects requests without a token', async () => {
      await request(http).get('/api/invoices').expect(401);
    });
  });

  describe('validation', () => {
    it('rejects unknown fields and invalid values with 400', async () => {
      const { api, newInvoice } = await userWithClient();
      await api
        .post('/api/clients', { name: 'X', unexpected: true })
        .expect(400);
      await newInvoice({ issueDate: 'not-a-date' }).expect(400);
      await newInvoice({
        items: [{ description: 'x'.repeat(10_000), quantity: 1, unitPrice: 1 }],
      }).expect(400);
    });
  });

  describe('invoices', () => {
    it('numbers invoices sequentially per year', async () => {
      const { newInvoice } = await userWithClient();
      const numbers: string[] = [];
      for (let i = 0; i < 3; i++) {
        const res = await newInvoice().expect(201);
        numbers.push((res.body as { displayNumber: string }).displayNumber);
      }
      expect(numbers).toEqual(['1/2026', '2/2026', '3/2026']);
    });

    it('gives concurrent creations distinct consecutive numbers', async () => {
      const { newInvoice } = await userWithClient();
      const results = await Promise.all(
        Array.from({ length: 5 }, () => newInvoice()),
      );

      expect(results.map((r) => r.status)).toEqual([201, 201, 201, 201, 201]);
      const numbers = results
        .map((r) => (r.body as { invoiceNumber: number }).invoiceNumber)
        .sort((a, b) => a - b);
      expect(numbers).toEqual([1, 2, 3, 4, 5]);
    });

    it('stores exact decimal amounts', async () => {
      const { newInvoice } = await userWithClient();
      const res = await newInvoice({
        items: [{ description: 'Sitno', quantity: 3, unitPrice: 0.1 }],
      }).expect(201);
      expect((res.body as { totalAmount: number }).totalAmount).toBe(0.3);
    });

    it('counts a paid invoice in KPO and the limits by payment date', async () => {
      const { api, newInvoice } = await userWithClient();
      const created = await newInvoice({
        issueDate: '2025-12-20',
        dueDate: '2026-01-05',
      }).expect(201);
      const id = (created.body as { id: string }).id;

      await api
        .patch(`/api/invoices/${id}`, { status: 'PAID', paidAt: '2026-01-03' })
        .expect(200);

      const kpo2025 = await api.get('/api/kpo?year=2025').expect(200);
      const kpo2026 = await api.get('/api/kpo?year=2026').expect(200);
      expect((kpo2025.body as { entries: unknown[] }).entries).toHaveLength(0);
      expect((kpo2026.body as { totalYearly: number }).totalYearly).toBe(
        100000,
      );
    });

    it('returns a PDF', async () => {
      const { api, newInvoice } = await userWithClient();
      const created = await newInvoice().expect(201);
      const res = await api
        .get(`/api/invoices/${(created.body as { id: string }).id}/pdf`)
        .buffer(true)
        .parse((response, done) => {
          const chunks: Buffer[] = [];
          response.on('data', (chunk: Buffer) => chunks.push(chunk));
          response.on('end', () => done(null, Buffer.concat(chunks)));
        })
        .expect(200)
        .expect('Content-Type', /application\/pdf/);
      expect((res.body as Buffer).subarray(0, 4).toString()).toBe('%PDF');
    });

    it("hides one user's invoices from another", async () => {
      const owner = await userWithClient();
      const created = await owner.newInvoice().expect(201);
      const id = (created.body as { id: string }).id;

      const stranger = authed((await register()).token);
      const list = await stranger.get('/api/invoices').expect(200);
      expect(list.body).toEqual([]);
      const single = await stranger.get(`/api/invoices/${id}`);
      expect([403, 404]).toContain(single.status);
    });
  });
  describe('tax calendar', () => {
    const obligationBody = {
      name: 'Porez na prihod',
      amount: 6500.5,
      recipientName: 'Poreska uprava',
      recipientAccount: '840-711122843-32',
      reference: '1234567890',
      startYear: 2026,
      startMonth: 9,
    };

    type Calendar = {
      months: {
        month: number;
        dueDate: string;
        items: {
          obligationId: string;
          amount: number;
          ipsQr: string | null;
          payment: { id: string } | null;
        }[];
      }[];
    };

    it('builds a calendar with IPS QR codes and tracks paid months', async () => {
      const { api } = await userWithClient();
      const created = await api
        .post('/api/taxes/obligations', obligationBody)
        .expect(201);
      const obligationId = (created.body as { id: string }).id;

      const calendar = (
        await api.get('/api/taxes/calendar?year=2026').expect(200)
      ).body as Calendar;
      expect(calendar.months.map((m) => m.month)).toEqual([9, 10, 11, 12]);
      expect(calendar.months[0].dueDate).toBe('2026-10-15');
      expect(calendar.months[0].items[0].ipsQr).toMatch(
        /^K:PR\|V:01\|C:1\|R:840000071112284332\|N:Poreska uprava\|I:RSD6500,50\|P:E2E User\|SF:253\|S:Porez na prihod 09\/2026\|RO:971234567890$/,
      );

      const paid = await api
        .post('/api/taxes/payments', {
          obligationId,
          year: 2026,
          month: 9,
          paidAt: '2026-10-14',
        })
        .expect(201);

      const after = (await api.get('/api/taxes/calendar?year=2026').expect(200))
        .body as Calendar;
      expect(after.months[0].items[0].payment).toMatchObject({
        id: (paid.body as { id: string }).id,
      });
      expect(after.months[1].items[0].payment).toBeNull();

      // History is protected: an obligation with payments cannot be deleted
      const stranger = authed((await register()).token);
      await stranger
        .delete(`/api/taxes/obligations/${obligationId}`)
        .expect(404);
      await api.delete(`/api/taxes/obligations/${obligationId}`).expect(409);
    });

    it('rejects an account number with wrong check digits', async () => {
      const { api } = await userWithClient();
      await api
        .post('/api/taxes/obligations', {
          ...obligationBody,
          recipientAccount: '840-711122843-33',
        })
        .expect(400);
    });
  });
});
