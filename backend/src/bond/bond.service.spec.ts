import { Test, TestingModule } from '@nestjs/testing';
import { BondService } from './bond.service';
import * as finance from './lib/finance';
import { CalculateBondDto } from './dto/calculate-bond.dto';

describe('BondService (integration with finance helpers)', () => {
  let service: BondService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BondService],
    }).compile();

    service = module.get<BondService>(BondService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('calculates a zero-coupon bond correctly', () => {
    const dto: CalculateBondDto = {
      faceValue: 1000,
      annualCouponRate: 0,
      marketPrice: 900,
      yearsToMaturity: 5,
      couponFrequency: 1,
    };

    const result = service.calculate(dto);

    const { totalPeriods, couponPaymentPerPeriod } =
      finance.getPeriodsAndCoupon(
        dto.faceValue,
        dto.annualCouponRate / 100,
        dto.yearsToMaturity,
        dto.couponFrequency,
      );

    const expectedYtm = finance.computeYtm(
      dto.faceValue,
      couponPaymentPerPeriod,
      dto.marketPrice,
      totalPeriods,
      dto.couponFrequency,
      dto.annualCouponRate / 100,
      dto.yearsToMaturity,
    );

    expect(result.currentYield).toBe(finance.round2(0));
    expect(result.ytm).toBe(expectedYtm);
    expect(result.premiumOrDiscount).toBe('discount');
    expect(result.totalInterest).toBe(
      finance.round2(
        finance.computeTotalInterest(couponPaymentPerPeriod, totalPeriods),
      ),
    );
    expect(result.cashFlowSchedule.length).toBe(totalPeriods);
    const last = result.cashFlowSchedule[result.cashFlowSchedule.length - 1];
    expect(last.remainingPrincipal).toBe(finance.round2(0));
  });

  it('calculates a par bond (price == face) where YTM ~= coupon rate', () => {
    const dto: CalculateBondDto = {
      faceValue: 1000,
      annualCouponRate: 5,
      marketPrice: 1000,
      yearsToMaturity: 3,
      couponFrequency: 1,
    };

    const res = service.calculate(dto);
    expect(res.premiumOrDiscount).toBe('par');
    // YTM should be approximately the coupon rate (5.00)
    expect(res.ytm).toBe(finance.round2(dto.annualCouponRate));
    expect(res.totalInterest).toBe(finance.round2(50 * 3));
  });

  it('handles premium bond and reports lower YTM than coupon', () => {
    const dto: CalculateBondDto = {
      faceValue: 1000,
      annualCouponRate: 6,
      marketPrice: 1100,
      yearsToMaturity: 4,
      couponFrequency: 1,
    };

    const res = service.calculate(dto);
    expect(res.premiumOrDiscount).toBe('premium');
    // current yield should match coupon / price * 100
    expect(res.currentYield).toBe(
      finance.round2(
        finance.computeCurrentYield(
          dto.faceValue,
          dto.annualCouponRate / 100,
          dto.marketPrice,
        ),
      ),
    );
    // YTM should be less than the coupon rate for premium bonds
    expect(res.ytm).toBeLessThan(finance.round2(dto.annualCouponRate));
  });

  it('supports semi-annual coupon frequency and builds schedule accordingly', () => {
    const dto: CalculateBondDto = {
      faceValue: 1000,
      annualCouponRate: 5,
      marketPrice: 980,
      yearsToMaturity: 2,
      couponFrequency: 2,
    };

    const res = service.calculate(dto);
    const { totalPeriods, couponPaymentPerPeriod } =
      finance.getPeriodsAndCoupon(
        dto.faceValue,
        dto.annualCouponRate / 100,
        dto.yearsToMaturity,
        dto.couponFrequency,
      );

    expect(totalPeriods).toBe(4);
    expect(res.cashFlowSchedule.length).toBe(totalPeriods);
    // all coupon payments in schedule should equal the per-period coupon (rounded)
    for (const entry of res.cashFlowSchedule) {
      expect(entry.couponPayment).toBe(finance.round2(couponPaymentPerPeriod));
    }
  });

  it('falls back to approximation when bracketing fails (very large market price)', () => {
    const dto: CalculateBondDto = {
      faceValue: 1000,
      annualCouponRate: 5,
      marketPrice: 1e9, // intentionally huge to force bracket failure
      yearsToMaturity: 5,
      couponFrequency: 1,
    };

    const { totalPeriods, couponPaymentPerPeriod } =
      finance.getPeriodsAndCoupon(
        dto.faceValue,
        dto.annualCouponRate / 100,
        dto.yearsToMaturity,
        dto.couponFrequency,
      );

    const expectedApprox = finance.computeYtm(
      dto.faceValue,
      couponPaymentPerPeriod,
      dto.marketPrice,
      totalPeriods,
      dto.couponFrequency,
      dto.annualCouponRate / 100,
      dto.yearsToMaturity,
    );

    const res = service.calculate(dto);
    expect(res.ytm).toBe(expectedApprox);
  });

  it('ensures numeric outputs are rounded to 2 decimals', () => {
    const dto: CalculateBondDto = {
      faceValue: 1000,
      annualCouponRate: 3.3333,
      marketPrice: 987.6543,
      yearsToMaturity: 7,
      couponFrequency: 2,
    };

    const res = service.calculate(dto);
    const numericFields = [res.currentYield, res.ytm, res.totalInterest];
    for (const n of numericFields) {
      const s = n.toString();
      const parts = s.split('.');
      expect(parts.length).toBeGreaterThanOrEqual(1);
      if (parts.length === 1) {
        // integer, implies .00
        expect(true).toBeTruthy();
      } else {
        expect(parts[1].length).toBeLessThanOrEqual(2);
      }
    }
  });

  it('produces deterministic cash-flow dates when system time is fixed', () => {
    // freeze time so schedule dates are deterministic
    const fixed = new Date('2020-01-01T00:00:00.000Z');
    // Use an any-typed jest helper for setSystemTime to avoid type mismatch
    (
      jest as unknown as {
        useFakeTimers: (opt?: unknown) => void;
        setSystemTime: (d: Date) => void;
      }
    ).useFakeTimers();
    (jest as unknown as { setSystemTime: (d: Date) => void }).setSystemTime(
      fixed,
    );

    const dto: CalculateBondDto = {
      faceValue: 1000,
      annualCouponRate: 5,
      marketPrice: 980,
      yearsToMaturity: 1,
      couponFrequency: 2,
    };

    const res = service.calculate(dto);
    // first payment should be periodMonths months after fixed date
    const periodMonths = Math.round(12 / dto.couponFrequency);
    const expectedFirst = new Date(fixed);
    expectedFirst.setMonth(expectedFirst.getMonth() + periodMonths);
    expect(new Date(res.cashFlowSchedule[0].paymentDate!).toISOString()).toBe(
      expectedFirst.toISOString(),
    );

    jest.useRealTimers();
  });

  it('handles extreme numeric inputs without producing NaN', () => {
    const dto: CalculateBondDto = {
      faceValue: 1e9,
      annualCouponRate: 10000, // 10k% coupon
      marketPrice: 0.01,
      yearsToMaturity: 100,
      couponFrequency: 2,
    };

    const res = service.calculate(dto);
    expect(Number.isFinite(res.currentYield)).toBeTruthy();
    expect(Number.isFinite(res.ytm)).toBeTruthy();
    expect(Number.isFinite(res.totalInterest)).toBeTruthy();
  });
});
