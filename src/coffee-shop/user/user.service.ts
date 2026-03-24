import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

const SALT_ROUNDS = 10;

/** Strips password_hash before returning to callers */
function sanitize(user: any) {
  if (!user) return user;
  const { password_hash: _, ...safe } = user;
  return safe;
}

@Injectable()
export class UserService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async findAll(role?: string) {
    let query = this.db
      .from('users')
      .select('id, username, name, role, is_active, branch_id, branches(id, name, address), created_at, updated_at')
      .order('name');
    if (role) query = query.eq('role', role);
    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('users')
      .select('id, username, name, role, is_active, branch_id, branches(id, name, address), created_at, updated_at')
      .eq('id', id)
      .single();
    if (error || !data) throw new NotFoundException(`User ${id} not found`);
    return data;
  }

  async create(dto: CreateUserDto) {
    // Check username uniqueness
    const { data: existing } = await this.db
      .from('users')
      .select('id')
      .eq('username', dto.username)
      .single();
    if (existing)
      throw new ConflictException(`Username "${dto.username}" is already taken`);

    const password_hash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const { password: _, ...rest } = dto;

    const { data, error } = await this.db
      .from('users')
      .insert({
        ...rest,
        password_hash,
        role: dto.role ?? 'cashier',
        is_active: dto.is_active ?? true,
        branch_id: dto.branch_id ?? null,
        updated_at: new Date().toISOString(),
      })
      .select('id, username, name, role, is_active, branch_id, branches(id, name, address), created_at, updated_at')
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const payload: Record<string, any> = {
      ...dto,
      updated_at: new Date().toISOString(),
    };
    if (dto.password) {
      payload.password_hash = await bcrypt.hash(dto.password, SALT_ROUNDS);
      delete payload.password;
    }
    const { data, error } = await this.db
      .from('users')
      .update(payload)
      .eq('id', id)
      .select('id, username, name, role, is_active, branch_id, branches(id, name, address), created_at, updated_at')
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async remove(id: string) {
    await this.findOne(id);
    const { error } = await this.db.from('users').delete().eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { message: `User ${id} deleted` };
  }

  async login(dto: LoginUserDto) {
    const { data: user, error } = await this.db
      .from('users')
      .select('*, branches(id, name, address, phone)')
      .eq('username', dto.username)
      .eq('is_active', true)
      .single();

    if (error || !user)
      throw new UnauthorizedException('Invalid username or password');

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid)
      throw new UnauthorizedException('Invalid username or password');

    return sanitize(user);
  }
}
