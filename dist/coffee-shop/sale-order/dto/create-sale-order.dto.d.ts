export declare class SelectedToppingDto {
    id: string;
    name: string;
    price: number;
}
export declare class OrderItemDto {
    product_id: string;
    quantity: number;
    unit_price?: number;
    size_label?: string;
    selected_toppings?: SelectedToppingDto[];
}
export declare class CreateSaleOrderDto {
    customer_id?: string;
    items: OrderItemDto[];
    note?: string;
    branch_id?: string;
}
