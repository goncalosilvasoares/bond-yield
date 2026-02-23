import { CashFlowEntryDto, PremiumOrDiscount } from '../dto/bond-response.dto';
export declare function round2(v: number): number;
export declare function getPeriodsAndCoupon(faceValue: number, annualCouponRateDecimal: number, yearsToMaturity: number, couponFrequency: number): {
    totalPeriods: number;
    couponPaymentPerPeriod: number;
};
export declare function computeCurrentYield(faceValue: number, annualCouponRateDecimal: number, marketPrice: number): number;
export declare function computeTotalInterest(couponPaymentPerPeriod: number, totalPeriods: number): number;
export declare function computePremiumOrDiscount(marketPrice: number, faceValue: number): PremiumOrDiscount;
export declare function buildCashFlowSchedule(faceValue: number, couponPaymentPerPeriod: number, totalPeriods: number, couponFrequency: number, startDate?: string | Date): CashFlowEntryDto[];
export declare function computeYtm(faceValue: number, couponPaymentPerPeriod: number, marketPrice: number, totalPeriods: number, couponFrequency: number, annualCouponRateDecimal: number, yearsToMaturity: number): number;
