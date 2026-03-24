export class CreateProductDto {
  name: string;
  description?: string;
  /** Legacy text category — use category_id when categories table is set up */
  category?: string;
  /** FK to categories table */
  category_id?: string;
  base_price: number;
  is_active?: boolean;
  icon?: string;
  image_url?: string;
}
