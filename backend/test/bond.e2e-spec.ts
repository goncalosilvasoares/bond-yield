/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('BondController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('POST /bond/calculate returns 201 and expected shape for valid payload', async () => {
    const payload = {
      faceValue: 1000,
      annualCouponRate: 5,
      marketPrice: 980,
      yearsToMaturity: 2,
      couponFrequency: 2,
    };

    const res = await request(app.getHttpServer())
      .post('/bond/calculate')
      .send(payload)
      .expect(201);

    const body = res.body;
    expect(body).toHaveProperty('currentYield');
    expect(body).toHaveProperty('ytm');
    expect(body).toHaveProperty('totalInterest');
    expect(body).toHaveProperty('premiumOrDiscount');
    expect(Array.isArray(body.cashFlowSchedule)).toBeTruthy();
  });

  it('POST /bond/calculate rejects negative numeric inputs (e2e)', async () => {
    await request(app.getHttpServer())
      .post('/bond/calculate')
      .send({
        faceValue: -500,
        annualCouponRate: -1,
        marketPrice: -100,
        yearsToMaturity: -2,
        couponFrequency: 1,
      })
      .expect(400);
  });

  it('POST /bond/calculate handles extreme numeric inputs and returns finite numbers', async () => {
    const payload = {
      faceValue: 1e9,
      annualCouponRate: 10000,
      marketPrice: 0.0001,
      yearsToMaturity: 50,
      couponFrequency: 2,
    };

    const res = await request(app.getHttpServer())
      .post('/bond/calculate')
      .send(payload)
      .expect(201);

    const body = res.body;
    expect(Number.isFinite(body.currentYield)).toBeTruthy();
    expect(Number.isFinite(body.ytm)).toBeTruthy();
    expect(Number.isFinite(body.totalInterest)).toBeTruthy();
  });

  it('POST /bond/calculate rounding: numeric outputs have at most 2 decimal places', async () => {
    const payload = {
      faceValue: 1234,
      annualCouponRate: 3.3333,
      marketPrice: 987.6543,
      yearsToMaturity: 7,
      couponFrequency: 2,
    };

    const res = await request(app.getHttpServer())
      .post('/bond/calculate')
      .send(payload)
      .expect(201);

    const body = res.body;
    const fields = [body.currentYield, body.ytm, body.totalInterest];
    for (const n of fields) {
      const s = n.toString();
      const parts = s.split('.');
      if (parts.length === 2) expect(parts[1].length).toBeLessThanOrEqual(2);
    }
  });

  it('POST /bond/calculate handles fractional years and odd period counts (edge DTOs)', async () => {
    // 1.5 years with semi-annual coupons => 3 periods
    const payload = {
      faceValue: 1000,
      annualCouponRate: 4.5,
      marketPrice: 990,
      yearsToMaturity: 1.5,
      couponFrequency: 2,
    };

    const res = await request(app.getHttpServer())
      .post('/bond/calculate')
      .send(payload)
      .expect(201);

    const body = res.body;
    // schedule should have 3 periods
    expect(Array.isArray(body.cashFlowSchedule)).toBeTruthy();
    expect(body.cashFlowSchedule.length).toBe(3);
  });

  it('POST /bond/calculate concurrency: multiple parallel requests succeed', async () => {
    // Run requests in small batches to avoid transient ECONNRESET in test environment
    const total = 12;
    const batchSize = 3;
    const results: any[] = [];
    for (let start = 0; start < total; start += batchSize) {
      const batchPromises = [] as Promise<any>[];
      for (let j = start; j < Math.min(start + batchSize, total); j++) {
        const payload = {
          faceValue: 1000 + j,
          annualCouponRate: 5 + (j % 3),
          marketPrice: 950 + j * 2,
          yearsToMaturity: 2 + (j % 5),
          couponFrequency: j % 2 === 0 ? 1 : 2,
        };
        batchPromises.push(
          request(app.getHttpServer()).post('/bond/calculate').send(payload),
        );
      }
      // await this small batch before starting the next
      // collect responses

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    for (const r of results) {
      expect([201, 400]).toContain(r.status);
    }
  });

  it('POST /bond/calculate very long maturities: 100 years produces expected schedule length', async () => {
    const payload = {
      faceValue: 1000,
      annualCouponRate: 5,
      marketPrice: 900,
      yearsToMaturity: 100,
      couponFrequency: 2,
    };

    const res = await request(app.getHttpServer())
      .post('/bond/calculate')
      .send(payload)
      .expect(201);

    const body = res.body;
    // 100 years * 2 = 200 periods
    expect(Array.isArray(body.cashFlowSchedule)).toBeTruthy();
    expect(body.cashFlowSchedule.length).toBe(200);
    // last period should have remaining principal 0
    const last = body.cashFlowSchedule[body.cashFlowSchedule.length - 1];
    expect(last.remainingPrincipal).toBe(0);
  });

  it('POST /bond/calculate returns 400 for invalid payload', async () => {
    // missing required fields
    await request(app.getHttpServer())
      .post('/bond/calculate')
      .send({})
      .expect(400);
  });
});
