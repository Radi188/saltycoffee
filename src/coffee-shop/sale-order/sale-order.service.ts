import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateSaleOrderDto } from './dto/create-sale-order.dto';

@Injectable()
export class SaleOrderService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  // ─── Document Number ────────────────────────────────────────────────────────
  private async generateOrderNumber(): Promise<string> {
    const date = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
    const { data, error } = await this.db.rpc('get_next_document_number', {
      p_prefix: 'SO',
      p_date: date,
    });
    if (error) throw new InternalServerErrorException(error.message);
    return data as string;
  }

  // ─── CRUD ───────────────────────────────────────────────────────────────────
  async findAll(status?: string, customerId?: string) {
    let query = this.db
      .from('sale_orders')
      .select('*, customers(*), sale_order_items(*, products(*))')
      .order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    if (customerId) query = query.eq('customer_id', customerId);
    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.db
      .from('sale_orders')
      .select('*, customers(*), sale_order_items(*, products(*))')
      .eq('id', id)
      .single();
    if (error || !data)
      throw new NotFoundException(`Sale order ${id} not found`);
    return data;
  }

  async create(dto: CreateSaleOrderDto) {
    if (!dto.items || dto.items.length === 0)
      throw new BadRequestException('Order must have at least one item');

    // Fetch products to get base prices
    const productIds = dto.items.map((i) => i.product_id);
    const { data: products, error: pErr } = await this.db
      .from('products')
      .select('id, name, base_price, is_active')
      .in('id', productIds);
    if (pErr) throw new InternalServerErrorException(pErr.message);

    const productMap = new Map(products!.map((p) => [p.id, p]));

    // Validate all products exist and are active
    for (const item of dto.items) {
      const product = productMap.get(item.product_id);
      if (!product) throw new BadRequestException(`Product ${item.product_id} not found`);
      if (!product.is_active) throw new BadRequestException(`Product "${product.name}" is not active`);
    }

    // Build order items
    const orderItems = dto.items.map((item) => {
      const product = productMap.get(item.product_id)!;
      const unitPrice = item.unit_price ?? product.base_price;
      const subtotal = parseFloat((unitPrice * item.quantity).toFixed(2));
      return {
        product_id: item.product_id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal,
        size_label: item.size_label ?? null,
        selected_toppings: item.selected_toppings ?? [],
      };
    });

    const subtotal = parseFloat(
      orderItems.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2),
    );

    const orderNumber = await this.generateOrderNumber();

    // Insert order
    const { data: order, error: oErr } = await this.db
      .from('sale_orders')
      .insert({
        order_number: orderNumber,
        customer_id: dto.customer_id ?? null,
        branch_id: dto.branch_id ?? null,
        status: 'draft',
        subtotal,
        note: dto.note ?? null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (oErr) throw new InternalServerErrorException(oErr.message);

    // Insert order items
    const itemsWithOrderId = orderItems.map((i) => ({
      ...i,
      order_id: order.id,
    }));
    const { error: iErr } = await this.db
      .from('sale_order_items')
      .insert(itemsWithOrderId);
    if (iErr) throw new InternalServerErrorException(iErr.message);

    return this.findOne(order.id);
  }

  async confirm(id: string) {
    const order = await this.findOne(id);
    if (order.status !== 'draft')
      throw new BadRequestException(`Order is already ${order.status}`);
    const { data, error } = await this.db
      .from('sale_orders')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async cancel(id: string) {
    const order = await this.findOne(id);
    if (order.status === 'cancelled')
      throw new BadRequestException('Order is already cancelled');
    const { data, error } = await this.db
      .from('sale_orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}
