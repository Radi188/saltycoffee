export class OpenShiftDto {
  /** ID of the user (cashier) opening the shift */
  user_id: string;
  /** Cash amount in the drawer at shift start */
  opening_cash: number;
  note?: string;
}
