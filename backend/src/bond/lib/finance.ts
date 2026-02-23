import { CashFlowEntryDto, PremiumOrDiscount } from '../dto/bond-response.dto';
import {
  HIGH_RATE_LIMIT,
  MAX_BRACKET_ATTEMPTS,
  MAX_ITERATIONS,
  YTM_TOLERANCE,
} from '../config';

/**
 * Round a number to 2 decimal places (safe for NaN/null inputs).
 * @param v number to round
 * @returns number rounded to 2 decimals
 */
export function round2(v: number) {
  return Number((Number(v) || 0).toFixed(2));
}

/**
 * Given bond inputs, return total payment periods and coupon per period.
 * @param faceValue nominal face value of the bond (e.g., 1000)
 * @param annualCouponRateDecimal annual coupon rate expressed as decimal (0.05 for 5%)
 * @param yearsToMaturity years until maturity (can be fractional)
 * @param couponFrequency payments per year (1=annual, 2=semiannual, ...)
 * @returns object with totalPeriods and couponPaymentPerPeriod
 */
export function getPeriodsAndCoupon(
  faceValue: number,
  annualCouponRateDecimal: number,
  yearsToMaturity: number,
  couponFrequency: number,
) {
  const totalPeriods = Math.max(
    1,
    Math.round(yearsToMaturity * couponFrequency),
  );
  const couponPaymentPerPeriod =
    (faceValue * annualCouponRateDecimal) / couponFrequency;
  return { totalPeriods, couponPaymentPerPeriod };
}

/**
 * Compute current yield as (annual coupon / market price) * 100 (percent).
 */
export function computeCurrentYield(
  faceValue: number,
  annualCouponRateDecimal: number,
  marketPrice: number,
) {
  const annualCoupon = faceValue * annualCouponRateDecimal;
  return marketPrice === 0 ? 0 : (annualCoupon / marketPrice) * 100;
}

/**
 * Total interest paid over the bond life (sum of coupon payments).
 */
export function computeTotalInterest(
  couponPaymentPerPeriod: number,
  totalPeriods: number,
) {
  return couponPaymentPerPeriod * totalPeriods;
}

/**
 * Determine whether the bond trades at a premium, discount, or par.
 */
export function computePremiumOrDiscount(
  marketPrice: number,
  faceValue: number,
): PremiumOrDiscount {
  return marketPrice > faceValue
    ? 'premium'
    : marketPrice < faceValue
      ? 'discount'
      : 'par';
}

/**
 * Build a cash flow schedule (coupon payments and remaining principal) as an array.
 * Optional startDate makes outputs deterministic for testing.
 */
export function buildCashFlowSchedule(
  faceValue: number,
  couponPaymentPerPeriod: number,
  totalPeriods: number,
  couponFrequency: number,
  startDate?: string | Date,
) {
  const schedule: CashFlowEntryDto[] = [];
  const periodMonths = Math.round(12 / couponFrequency);
  const start = startDate ? new Date(startDate) : new Date();
  let cumulativeInterest = 0;
  let remainingPrincipal = faceValue;

  for (let periodIndex = 1; periodIndex <= totalPeriods; periodIndex++) {
    const isLastPeriod = periodIndex === totalPeriods;
    const couponPayment = couponPaymentPerPeriod;
    cumulativeInterest += couponPayment;
    remainingPrincipal = isLastPeriod ? 0 : faceValue;

    const paymentDate = new Date(start);
    paymentDate.setMonth(paymentDate.getMonth() + periodMonths * periodIndex);

    schedule.push({
      period: periodIndex,
      paymentDate: paymentDate.toISOString(),
      couponPayment: round2(couponPayment),
      cumulativeInterest: round2(cumulativeInterest),
      remainingPrincipal: round2(remainingPrincipal),
    });
  }

  return schedule;
}

/**
 * Compute yield to maturity (annualized percent). Uses analytic solution for
 * zero-coupon bonds and a bisection numeric solver for coupon-bearing bonds.
 * Falls back to a simple approximation if bracketing fails.
 */
export function computeYtm(
  faceValue: number,
  couponPaymentPerPeriod: number,
  marketPrice: number,
  totalPeriods: number,
  couponFrequency: number,
  annualCouponRateDecimal: number,
  yearsToMaturity: number,
) {
  if (couponPaymentPerPeriod === 0) {
    const periodicRate =
      Math.pow(faceValue / marketPrice, 1 / totalPeriods) - 1;
    return round2(periodicRate * couponFrequency * 100);
  }

  const priceDifferenceFunction = (r: number) => {
    let presentValue = 0;
    for (let k = 1; k <= totalPeriods; k++) {
      presentValue += couponPaymentPerPeriod / Math.pow(1 + r, k);
    }
    presentValue += faceValue / Math.pow(1 + r, totalPeriods);
    return presentValue - marketPrice;
  };

  let lowerBound = 0;
  let upperBound = 1;
  let fLower = priceDifferenceFunction(lowerBound);
  let fUpper = priceDifferenceFunction(upperBound);
  let bracketAttempts = 0;
  while (
    fLower * fUpper > 0 &&
    bracketAttempts < MAX_BRACKET_ATTEMPTS &&
    upperBound <= HIGH_RATE_LIMIT
  ) {
    upperBound *= 2;
    fUpper = priceDifferenceFunction(upperBound);
    bracketAttempts++;
  }

  if (fLower * fUpper > 0) {
    const annualCoupon = faceValue * annualCouponRateDecimal;
    const ytmApprox =
      (annualCoupon + (faceValue - marketPrice) / yearsToMaturity) /
      ((faceValue + marketPrice) / 2);
    return round2((ytmApprox || 0) * 100);
  }

  let periodicRate = 0;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const midRate = (lowerBound + upperBound) / 2;
    const fMid = priceDifferenceFunction(midRate);
    if (Math.abs(fMid) < YTM_TOLERANCE) {
      periodicRate = midRate;
      break;
    }
    if (fLower * fMid <= 0) {
      upperBound = midRate;
      fUpper = fMid;
    } else {
      lowerBound = midRate;
      fLower = fMid;
    }
    periodicRate = (lowerBound + upperBound) / 2;
  }

  return round2(periodicRate * couponFrequency * 100);
}
