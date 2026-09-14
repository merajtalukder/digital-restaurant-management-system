export class CreateOrderItemDto {
  menuItemId!: number;

  quantity!: number;

  specialInstructions?: string;
}

export class CreateOrderDto {
  customerName?: string;

  orderType!: 'WAITER' | 'QR';

  tableId!: number;

  // Optional because QR orders don't have a waiter
  waiterId?: number;

  items!: CreateOrderItemDto[];
}