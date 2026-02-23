/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
describe('config env overrides and solver integration', () => {
  const OLD_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...OLD_ENV };
    // clear module cache so subsequent imports pick up original env
    jest.resetModules();
  });

  it('loads environment overrides into config', () => {
    process.env.HIGH_RATE_LIMIT = '1000000';
    process.env.MAX_BRACKET_ATTEMPTS = '3';
    process.env.MAX_ITERATIONS = '5';
    process.env.YTM_TOLERANCE = '1e-12';

    jest.resetModules();
    // Use require for module reload in test

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cfg = require('../config');
    expect(cfg.HIGH_RATE_LIMIT).toBe(1000000);
    expect(cfg.MAX_BRACKET_ATTEMPTS).toBe(3);
    expect(cfg.MAX_ITERATIONS).toBe(5);
    expect(cfg.YTM_TOLERANCE).toBe(parseFloat('1e-12'));
  });

  it('computeYtm runs without error when config is overridden', () => {
    process.env.HIGH_RATE_LIMIT = '10';
    process.env.MAX_BRACKET_ATTEMPTS = '1';
    process.env.MAX_ITERATIONS = '1';
    process.env.YTM_TOLERANCE = '1e-2';

    jest.resetModules();
    // Use require for module reload in test

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const finance = require('./finance');

    const faceValue = 1000;
    const annualCouponRateDecimal = 0.05; // 5%
    const couponFrequency = 2; // semiannual
    const yearsToMaturity = 5;
    const totalPeriods = Math.round(yearsToMaturity * couponFrequency);
    const couponPaymentPerPeriod =
      (faceValue * annualCouponRateDecimal) / couponFrequency;
    const marketPrice = 950;

    const ytm = finance.computeYtm(
      faceValue,
      couponPaymentPerPeriod,
      marketPrice,
      totalPeriods,
      couponFrequency,
      annualCouponRateDecimal,
      yearsToMaturity,
    );

    expect(typeof ytm).toBe('number');
    expect(Number.isFinite(ytm)).toBe(true);
  });
});
