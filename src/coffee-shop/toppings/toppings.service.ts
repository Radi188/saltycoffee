import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';

@Injectable()
export class ToppingsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async findAll(activeOnly = false) {
    let q = this.db
      .from('toppings')
      .select('*')
      .order('sort_order')
      .order('name');
    if (activeOnly) q = q.eq('is_active', true);
    const { data, error } = await q;
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('toppings')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) throw new NotFoundException(`Topping ${id} not found`);
    return data;
  }

  async create(dto: CreateToppingDto) {
    const { data, error } = await this.db
      .from('toppings')
      .insert(dto)
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async update(id: string, dto: UpdateToppingDto) {
    await this.findOne(id);
    const { data, error } = await this.db
      .from('toppings')
      .update(dto)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async remove(id: string) {
    await this.findOne(id);
    const { error } = await this.db.from('toppings').delete().eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { message: `Topping ${id} deleted` };
  }
}
