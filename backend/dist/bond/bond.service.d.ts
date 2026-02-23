import { CalculateBondDto } from './dto/calculate-bond.dto';
import { BondCalculationResultDto } from './dto/bond-response.dto';
export declare class BondService {
    calculate(dto: CalculateBondDto): BondCalculationResultDto;
}
