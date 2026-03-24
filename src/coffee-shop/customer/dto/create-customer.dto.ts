export class CreateCustomerDto {
  name: string;
  email?: string;
  phone?: string;
  tier?: string; // regular | silver | gold | vip
}
