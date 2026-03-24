"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSaleOrderDto = exports.OrderItemDto = exports.SelectedToppingDto = void 0;
class SelectedToppingDto {
    id;
    name;
    price;
}
exports.SelectedToppingDto = SelectedToppingDto;
class OrderItemDto {
    product_id;
    quantity;
    unit_price;
    size_label;
    selected_toppings;
}
exports.OrderItemDto = OrderItemDto;
class CreateSaleOrderDto {
    customer_id;
    items;
    note;
    branch_id;
}
exports.CreateSaleOrderDto = CreateSaleOrderDto;
//# sourceMappingURL=create-sale-order.dto.js.map