/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { BondController } from './bond.controller';
import { BondService } from './bond.service';
import { CalculateBondDto } from './dto/calculate-bond.dto';
import { BondCalculationResultDto } from './dto/bond-response.dto';

describe('BondController', () => {
  let app: INestApplication;

  afterEach(async () => {
    if (app) await app.close();
  });

  it('integration: POST /bond/calculate returns calculation for valid input', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BondController],
      providers: [BondService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

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

    expect(res.body).toHaveProperty('currentYield');
    expect(res.body).toHaveProperty('ytm');
    expect(res.body).toHaveProperty('totalInterest');
    expect(res.body).toHaveProperty('premiumOrDiscount');
    const body = res.body as BondCalculationResultDto;
    expect(Array.isArray(body.cashFlowSchedule)).toBeTruthy();
  });

  it('validation: POST /bond/calculate returns 400 for invalid input', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BondController],
      providers: [BondService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    // missing required fields
    await request(app.getHttpServer())
      .post('/bond/calculate')
      .send({})
      .expect(400);
  });

  it('validation: POST /bond/calculate rejects negative or nonsensical numeric inputs', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BondController],
      providers: [BondService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    // negative faceValue should be rejected
    await request(app.getHttpServer())
      .post('/bond/calculate')
      .send({
        faceValue: -1000,
        annualCouponRate: 5,
        marketPrice: 900,
        yearsToMaturity: 5,
        couponFrequency: 1,
      })
      .expect(400);

    // zero or negative yearsToMaturity should be rejected
    await request(app.getHttpServer())
      .post('/bond/calculate')
      .send({
        faceValue: 1000,
        annualCouponRate: 5,
        marketPrice: 900,
        yearsToMaturity: 0,
        couponFrequency: 1,
      })
      .expect(400);
  });

  it('unit: delegates to BondService.calculate', async () => {
    const fakeResult = {
      currentYield: 1.23,
      ytm: 4.56,
      totalInterest: 100,
      premiumOrDiscount: 'par',
      cashFlowSchedule: [],
    };

    const calculateSpy = jest.fn().mockReturnValue(fakeResult);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BondController],
      providers: [
        {
          provide: BondService,
          useValue: { calculate: calculateSpy },
        },
      ],
    }).compile();

    const controller = moduleFixture.get<BondController>(BondController);
    const dto: CalculateBondDto = {
      faceValue: 1000,
      annualCouponRate: 5,
      marketPrice: 1000,
      yearsToMaturity: 1,
      couponFrequency: 1,
    };

    const out = controller.calculate(dto);
    expect(calculateSpy).toHaveBeenCalledWith(dto);
    expect(out).toEqual(fakeResult);
  });
});
