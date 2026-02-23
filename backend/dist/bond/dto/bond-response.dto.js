"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BondCalculationResultDto = exports.CashFlowEntryDto = void 0;
class CashFlowEntryDto {
    period;
    paymentDate;
    couponPayment;
    cumulativeInterest;
    remainingPrincipal;
}
exports.CashFlowEntryDto = CashFlowEntryDto;
class BondCalculationResultDto {
    currentYield;
    ytm;
    totalInterest;
    premiumOrDiscount;
    cashFlowSchedule;
}
exports.BondCalculationResultDto = BondCalculationResultDto;
//# sourceMappingURL=bond-response.dto.js.map