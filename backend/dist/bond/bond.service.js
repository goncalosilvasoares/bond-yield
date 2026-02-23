"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BondService = void 0;
const common_1 = require("@nestjs/common");
const finance_1 = require("./lib/finance");
let BondService = class BondService {
    calculate(dto) {
        const faceValue = dto.faceValue;
        const annualCouponRateDecimal = dto.annualCouponRate / 100;
        const marketPrice = dto.marketPrice;
        const yearsToMaturity = dto.yearsToMaturity;
        const couponFrequency = dto.couponFrequency;
        const { totalPeriods, couponPaymentPerPeriod } = (0, finance_1.getPeriodsAndCoupon)(faceValue, annualCouponRateDecimal, yearsToMaturity, couponFrequency);
        const currentYield = (0, finance_1.round2)((0, finance_1.computeCurrentYield)(faceValue, annualCouponRateDecimal, marketPrice));
        const totalInterest = (0, finance_1.round2)((0, finance_1.computeTotalInterest)(couponPaymentPerPeriod, totalPeriods));
        const premiumOrDiscount = (0, finance_1.computePremiumOrDiscount)(marketPrice, faceValue);
        const cashFlowSchedule = (0, finance_1.buildCashFlowSchedule)(faceValue, couponPaymentPerPeriod, totalPeriods, couponFrequency);
        const ytm = (0, finance_1.computeYtm)(faceValue, couponPaymentPerPeriod, marketPrice, totalPeriods, couponFrequency, annualCouponRateDecimal, yearsToMaturity);
        return {
            currentYield,
            ytm,
            totalInterest,
            premiumOrDiscount,
            cashFlowSchedule,
        };
    }
};
exports.BondService = BondService;
exports.BondService = BondService = __decorate([
    (0, common_1.Injectable)()
], BondService);
//# sourceMappingURL=bond.service.js.map