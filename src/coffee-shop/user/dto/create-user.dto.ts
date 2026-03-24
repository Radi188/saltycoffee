export class CreateUserDto {
  username: string;
  password: string;
  name: string;
  /** admin | manager | cashier */
  role?: string;
  is_active?: boolean;
  /** Branch the user (cashier) belongs to */
  branch_id?: string;
}
