import { BondService } from './bond.service';
import { CalculateBondDto } from './dto/calculate-bond.dto';
export declare class BondController {
    private readonly bondService;
    constructor(bondService: BondService);
    calculate(dto: CalculateBondDto): import("./dto/bond-response.dto").BondCalculationResultDto;
}
