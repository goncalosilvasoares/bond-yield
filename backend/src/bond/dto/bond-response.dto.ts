/**
 * Response types for bond calculation results returned by the BondService
 */

export class CashFlowEntryDto {
  /** Period index (1..n) */
  period: number;

  /** Payment date (ISO string) - optional when service doesn't compute real dates */
  paymentDate?: string;

  /** Coupon payment amount for the period */
  couponPayment: number;

  /** Cumulative interest earned up to and including this period */
  cumulativeInterest: number;

  /** Remaining principal after this payment */
  remainingPrincipal: number;
}

export type PremiumOrDiscount = 'premium' | 'discount' | 'par';

export class BondCalculationResultDto {
  /** Current yield in percent (e.g., 5 = 5%) */
  currentYield: number;

  /** Yield to Maturity (annualized percent) */
  ytm: number;

  /** Total interest earned over the life of the bond */
  totalInterest: number;

  /** Indicator whether the bond trades above (premium) or below (discount) face value */
  premiumOrDiscount: PremiumOrDiscount;

  /** Cash flow schedule */
  cashFlowSchedule: CashFlowEntryDto[];
}
