import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async findAll(activeOnly = false) {
    let query = this.db
      .from('categories')
      .select('*')
      .order('sort_order')
      .order('name');
    if (activeOnly) query = query.eq('is_active', true);
    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) throw new NotFoundException(`Category ${id} not found`);
    return data;
  }

  async create(dto: CreateCategoryDto) {
    const { data, error } = await this.db
      .from('categories')
      .insert({
        sort_order: 0,
        is_active: true,
        ...dto,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) {
      if (error.code === '23505')
        throw new ConflictException(`Category name "${dto.name}" already exists`);
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    const { data, error } = await this.db
      .from('categories')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      if (error.code === '23505')
        throw new ConflictException(`Category name "${dto.name}" already exists`);
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async remove(id: string) {
    await this.findOne(id);
    const { error } = await this.db.from('categories').delete().eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { message: `Category ${id} deleted` };
  }
}
