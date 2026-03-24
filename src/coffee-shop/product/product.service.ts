import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async findAll(category?: string, categoryId?: string) {
    let query = this.db
      .from('products')
      .select('*, categories(id, name), product_sizes(id, size_label, price, sort_order, is_active)')
      .order('name');
    if (category) query = query.eq('category', category);
    if (categoryId) query = query.eq('category_id', categoryId);
    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('products')
      .select('*, categories(id, name), product_sizes(id, size_label, price, sort_order, is_active)')
      .eq('id', id)
      .single();
    if (error || !data) throw new NotFoundException(`Product ${id} not found`);
    return data;
  }

  async create(dto: CreateProductDto) {
    const { data, error } = await this.db
      .from('products')
      .insert({ ...dto, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    const { data, error } = await this.db
      .from('products')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async remove(id: string) {
    await this.findOne(id);
    const { error } = await this.db.from('products').delete().eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { message: `Product ${id} deleted` };
  }

  async uploadImage(file: Express.Multer.File) {
    const bucket = 'product-images';
    const ext = extname(file.originalname) || '.jpg';
    const path = `${randomUUID()}${ext}`;
    const { error } = await this.db.storage
      .from(bucket)
      .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });
    if (error) throw new InternalServerErrorException(error.message);
    const { data } = this.db.storage.from(bucket).getPublicUrl(path);
    return { url: data.publicUrl };
  }
}
