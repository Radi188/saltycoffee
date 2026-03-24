export class UpdateUserDto {
  name?: string;
  /** Provide new password to change it */
  password?: string;
  role?: string;
  is_active?: boolean;
  /** Branch the user (cashier) belongs to */
  branch_id?: string;
}
