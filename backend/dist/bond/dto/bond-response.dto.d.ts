export declare class CashFlowEntryDto {
    period: number;
    paymentDate?: string;
    couponPayment: number;
    cumulativeInterest: number;
    remainingPrincipal: number;
}
export type PremiumOrDiscount = 'premium' | 'discount' | 'par';
export declare class BondCalculationResultDto {
    currentYield: number;
    ytm: number;
    totalInterest: number;
    premiumOrDiscount: PremiumOrDiscount;
    cashFlowSchedule: CashFlowEntryDto[];
}
