import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateProductSizeDto } from './dto/create-product-size.dto';

@Injectable()
export class ProductSizesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async findByProduct(productId: string) {
    const { data, error } = await this.db
      .from('product_sizes')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order');
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async create(dto: CreateProductSizeDto) {
    const { data, error } = await this.db
      .from('product_sizes')
      .insert(dto)
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async update(id: string, dto: Partial<CreateProductSizeDto>) {
    const { data, error } = await this.db
      .from('product_sizes')
      .update(dto)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw new NotFoundException(`ProductSize ${id} not found`);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.db.from('product_sizes').delete().eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { message: `ProductSize ${id} deleted` };
  }

  async removeAllByLabel(sizeLabel: string) {
    const { error, count } = await this.db
      .from('product_sizes')
      .delete({ count: 'exact' })
      .eq('size_label', sizeLabel);
    if (error) throw new InternalServerErrorException(error.message);
    return { message: `Deleted all "${sizeLabel}" sizes`, deleted: count };
  }
}
