export class CreateCategoryDto {
  name: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
  icon?: string;
  color?: string;
}
