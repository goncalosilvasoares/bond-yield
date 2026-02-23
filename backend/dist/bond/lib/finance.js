"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.round2 = round2;
exports.getPeriodsAndCoupon = getPeriodsAndCoupon;
exports.computeCurrentYield = computeCurrentYield;
exports.computeTotalInterest = computeTotalInterest;
exports.computePremiumOrDiscount = computePremiumOrDiscount;
exports.buildCashFlowSchedule = buildCashFlowSchedule;
exports.computeYtm = computeYtm;
const config_1 = require("../config");
function round2(v) {
    return Number((Number(v) || 0).toFixed(2));
}
function getPeriodsAndCoupon(faceValue, annualCouponRateDecimal, yearsToMaturity, couponFrequency) {
    const totalPeriods = Math.max(1, Math.round(yearsToMaturity * couponFrequency));
    const couponPaymentPerPeriod = (faceValue * annualCouponRateDecimal) / couponFrequency;
    return { totalPeriods, couponPaymentPerPeriod };
}
function computeCurrentYield(faceValue, annualCouponRateDecimal, marketPrice) {
    const annualCoupon = faceValue * annualCouponRateDecimal;
    return marketPrice === 0 ? 0 : (annualCoupon / marketPrice) * 100;
}
function computeTotalInterest(couponPaymentPerPeriod, totalPeriods) {
    return couponPaymentPerPeriod * totalPeriods;
}
function computePremiumOrDiscount(marketPrice, faceValue) {
    return marketPrice > faceValue
        ? 'premium'
        : marketPrice < faceValue
            ? 'discount'
            : 'par';
}
function buildCashFlowSchedule(faceValue, couponPaymentPerPeriod, totalPeriods, couponFrequency, startDate) {
    const schedule = [];
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
function computeYtm(faceValue, couponPaymentPerPeriod, marketPrice, totalPeriods, couponFrequency, annualCouponRateDecimal, yearsToMaturity) {
    if (couponPaymentPerPeriod === 0) {
        const periodicRate = Math.pow(faceValue / marketPrice, 1 / totalPeriods) - 1;
        return round2(periodicRate * couponFrequency * 100);
    }
    const priceDifferenceFunction = (r) => {
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
    while (fLower * fUpper > 0 &&
        bracketAttempts < config_1.MAX_BRACKET_ATTEMPTS &&
        upperBound <= config_1.HIGH_RATE_LIMIT) {
        upperBound *= 2;
        fUpper = priceDifferenceFunction(upperBound);
        bracketAttempts++;
    }
    if (fLower * fUpper > 0) {
        const annualCoupon = faceValue * annualCouponRateDecimal;
        const ytmApprox = (annualCoupon + (faceValue - marketPrice) / yearsToMaturity) /
            ((faceValue + marketPrice) / 2);
        return round2((ytmApprox || 0) * 100);
    }
    let periodicRate = 0;
    for (let i = 0; i < config_1.MAX_ITERATIONS; i++) {
        const midRate = (lowerBound + upperBound) / 2;
        const fMid = priceDifferenceFunction(midRate);
        if (Math.abs(fMid) < config_1.YTM_TOLERANCE) {
            periodicRate = midRate;
            break;
        }
        if (fLower * fMid <= 0) {
            upperBound = midRate;
            fUpper = fMid;
        }
        else {
            lowerBound = midRate;
            fLower = fMid;
        }
        periodicRate = (lowerBound + upperBound) / 2;
    }
    return round2(periodicRate * couponFrequency * 100);
}
//# sourceMappingURL=finance.js.map