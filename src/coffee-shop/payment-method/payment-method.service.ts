import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentMethodService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async findAll(activeOnly = false) {
    let query = this.db
      .from('payment_methods')
      .select('*')
      .order('name');
    if (activeOnly) query = query.eq('is_active', true);
    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('payment_methods')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data)
      throw new NotFoundException(`Payment method ${id} not found`);
    return data;
  }

  async findByCode(code: string) {
    const { data, error } = await this.db
      .from('payment_methods')
      .select('*')
      .eq('code', code)
      .single();
    if (error || !data)
      throw new NotFoundException(`Payment method code "${code}" not found`);
    return data;
  }

  async create(dto: CreatePaymentMethodDto) {
    const { data, error } = await this.db
      .from('payment_methods')
      .insert({ is_active: true, ...dto, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) {
      if (error.code === '23505')
        throw new ConflictException(`Payment method code "${dto.code}" already exists`);
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async update(id: string, dto: UpdatePaymentMethodDto) {
    await this.findOne(id);
    const { data, error } = await this.db
      .from('payment_methods')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      if (error.code === '23505')
        throw new ConflictException(`Payment method code "${dto.code}" already exists`);
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async remove(id: string) {
    await this.findOne(id);
    const { error } = await this.db
      .from('payment_methods')
      .delete()
      .eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { message: `Payment method ${id} deleted` };
  }
}
