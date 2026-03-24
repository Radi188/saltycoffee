export class CreateSaleInvoiceDto {
  /** Sale order to generate this invoice from */
  order_id: string;
  note?: string;
}
