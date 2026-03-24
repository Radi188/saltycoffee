import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
export declare class BranchController {
    private readonly branchService;
    constructor(branchService: BranchService);
    findAll(activeOnly?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateBranchDto): Promise<any>;
    update(id: string, dto: UpdateBranchDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
