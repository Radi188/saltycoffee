export class SelectedToppingDto {
  id: string;
  name: string;
  price: number;
}

export class OrderItemDto {
  product_id: string;
  quantity: number;
  /** Total unit price inclusive of size + toppings (calculated by client) */
  unit_price?: number;
  /** Selected size label, e.g. 'S', 'M', 'L' */
  size_label?: string;
  /** Toppings chosen for this line */
  selected_toppings?: SelectedToppingDto[];
}

export class CreateSaleOrderDto {
  customer_id?: string;
  items: OrderItemDto[];
  note?: string;
  branch_id?: string;
}
