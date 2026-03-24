import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async findAll(tier?: string) {
    let query = this.db.from('customers').select('*').order('name');
    if (tier) query = query.eq('tier', tier);
    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) throw new NotFoundException(`Customer ${id} not found`);
    return data;
  }

  async create(dto: CreateCustomerDto) {
    const { data, error } = await this.db
      .from('customers')
      .insert({ tier: 'regular', ...dto, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);
    const { data, error } = await this.db
      .from('customers')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async remove(id: string) {
    await this.findOne(id);
    const { error } = await this.db.from('customers').delete().eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { message: `Customer ${id} deleted` };
  }
}
