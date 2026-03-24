import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
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
    login(dto: LoginUserDto): Promise<any>;
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
}
