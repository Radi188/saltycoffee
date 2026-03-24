export class CreatePaymentMethodDto {
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
}
