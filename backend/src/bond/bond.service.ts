import { Injectable } from '@nestjs/common';
import { CalculateBondDto } from './dto/calculate-bond.dto';
import { BondCalculationResultDto } from './dto/bond-response.dto';
import {
  round2,
  getPeriodsAndCoupon,
  computeCurrentYield,
  computeTotalInterest,
  computePremiumOrDiscount,
  buildCashFlowSchedule,
  computeYtm,
} from './lib/finance';

@Injectable()
export class BondService {
  calculate(dto: CalculateBondDto): BondCalculationResultDto {
    const faceValue = dto.faceValue;
    const annualCouponRateDecimal = dto.annualCouponRate / 100;
    const marketPrice = dto.marketPrice;
    const yearsToMaturity = dto.yearsToMaturity;
    const couponFrequency = dto.couponFrequency;

    const { totalPeriods, couponPaymentPerPeriod } = getPeriodsAndCoupon(
      faceValue,
      annualCouponRateDecimal,
      yearsToMaturity,
      couponFrequency,
    );

    const currentYield = round2(
      computeCurrentYield(faceValue, annualCouponRateDecimal, marketPrice),
    );
    const totalInterest = round2(
      computeTotalInterest(couponPaymentPerPeriod, totalPeriods),
    );
    const premiumOrDiscount = computePremiumOrDiscount(marketPrice, faceValue);

    const cashFlowSchedule = buildCashFlowSchedule(
      faceValue,
      couponPaymentPerPeriod,
      totalPeriods,
      couponFrequency,
    );

    const ytm = computeYtm(
      faceValue,
      couponPaymentPerPeriod,
      marketPrice,
      totalPeriods,
      couponFrequency,
      annualCouponRateDecimal,
      yearsToMaturity,
    );

    return {
      currentYield,
      ytm,
      totalInterest,
      premiumOrDiscount,
      cashFlowSchedule,
    };
  }
}
