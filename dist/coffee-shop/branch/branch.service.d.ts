import { SupabaseService } from '../../supabase/supabase.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
export declare class BranchService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private get db();
    findAll(activeOnly?: boolean): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateBranchDto): Promise<any>;
    update(id: string, dto: UpdateBranchDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
