import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsPositive } from 'class-validator';

export class CalculateBondDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  faceValue: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  annualCouponRate: number; // percent (e.g., 5 for 5%)

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  marketPrice: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  yearsToMaturity: number;

  @Type(() => Number)
  @IsNumber()
  @IsIn([1, 2])
  couponFrequency: number; // 1 = annual, 2 = semi-annual
}
