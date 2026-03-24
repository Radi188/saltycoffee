import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async findAll(activeOnly = false) {
    let query = this.db
      .from('branches')
      .select('*')
      .order('name');
    if (activeOnly) query = query.eq('is_active', true);
    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('branches')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) throw new NotFoundException(`Branch ${id} not found`);
    return data;
  }

  async create(dto: CreateBranchDto) {
    const { data: existing } = await this.db
      .from('branches')
      .select('id')
      .eq('name', dto.name)
      .single();
    if (existing)
      throw new ConflictException(`Branch name "${dto.name}" is already taken`);

    const { data, error } = await this.db
      .from('branches')
      .insert({
        ...dto,
        is_active: dto.is_active ?? true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async update(id: string, dto: UpdateBranchDto) {
    await this.findOne(id);
    const { data, error } = await this.db
      .from('branches')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async remove(id: string) {
    await this.findOne(id);
    const { error } = await this.db.from('branches').delete().eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { message: `Branch ${id} deleted` };
  }
}
