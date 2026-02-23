import {
  round2,
  getPeriodsAndCoupon,
  computeCurrentYield,
  computeTotalInterest,
  computePremiumOrDiscount,
  buildCashFlowSchedule,
  computeYtm,
} from './finance';

describe('finance helpers', () => {
  test('round2 works', () => {
    expect(round2(1.2345)).toBe(1.23);
    expect(round2(1.235)).toBe(1.24);
    expect(round2(NaN)).toBe(0);
  });

  test('getPeriodsAndCoupon returns correct values', () => {
    const { totalPeriods, couponPaymentPerPeriod } = getPeriodsAndCoupon(
      1000,
      0.05,
      2,
      2,
    );
    expect(totalPeriods).toBe(4);
    expect(couponPaymentPerPeriod).toBe(25);
  });

  test('computeCurrentYield and total interest', () => {
    const cy = computeCurrentYield(1000, 0.05, 900);
    expect(cy).toBeCloseTo(((1000 * 0.05) / 900) * 100);

    const total = computeTotalInterest(25, 4);
    expect(total).toBe(100);
  });

  test('computePremiumOrDiscount', () => {
    expect(computePremiumOrDiscount(1100, 1000)).toBe('premium');
    expect(computePremiumOrDiscount(900, 1000)).toBe('discount');
    expect(computePremiumOrDiscount(1000, 1000)).toBe('par');
  });

  test('buildCashFlowSchedule deterministic startDate', () => {
    const schedule = buildCashFlowSchedule(1000, 25, 4, 2, '2020-01-01');
    expect(schedule).toHaveLength(4);
    const expectedFirst = new Date('2020-01-01');
    expectedFirst.setMonth(expectedFirst.getMonth() + 6);
    expect(schedule[0].paymentDate).toBe(expectedFirst.toISOString());
    expect(schedule[3].remainingPrincipal).toBe(0);
  });

  test('computeYtm zero-coupon analytic', () => {
    // zero-coupon: couponPaymentPerPeriod = 0
    const ytm = computeYtm(1000, 0, 500, 5, 1, 0, 5);
    // periodic rate = (1000/500)^(1/5)-1
    const periodic = Math.pow(1000 / 500, 1 / 5) - 1;
    expect(ytm).toBeCloseTo(Number((periodic * 1 * 100).toFixed(2)));
  });

  test('computeYtm simple coupon case', () => {
    // one period, coupon 50, price 980 -> r = 1050/980 -1
    const ytm = computeYtm(1000, 50, 980, 1, 1, 0.05, 1);
    const periodic = 1050 / 980 - 1;
    expect(ytm).toBeCloseTo(Number((periodic * 100).toFixed(2)));
  });
});
