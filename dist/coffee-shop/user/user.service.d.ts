import { SupabaseService } from '../../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
export declare class UserService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private get db();
    findAll(role?: string): Promise<{
        id: any;
        username: any;
        name: any;
        role: any;
        is_active: any;
        branch_id: any;
        branches: {
            id: any;
            name: any;
            address: any;
        }[];
        created_at: any;
        updated_at: any;
    }[]>;
    findOne(id: string): Promise<{
        id: any;
        username: any;
        name: any;
        role: any;
        is_active: any;
        branch_id: any;
        branches: {
            id: any;
            name: any;
            address: any;
        }[];
        created_at: any;
        updated_at: any;
    }>;
    create(dto: CreateUserDto): Promise<{
        id: any;
        username: any;
        name: any;
        role: any;
        is_active: any;
        branch_id: any;
        branches: {
            id: any;
            name: any;
            address: any;
        }[];
        created_at: any;
        updated_at: any;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: any;
        username: any;
        name: any;
        role: any;
        is_active: any;
        branch_id: any;
        branches: {
            id: any;
            name: any;
            address: any;
        }[];
        created_at: any;
        updated_at: any;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    login(dto: LoginUserDto): Promise<any>;
}
