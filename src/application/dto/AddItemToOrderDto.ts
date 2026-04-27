export type AddItemToOrderDto = {
  readonly orderId: string;
  readonly itemId: string;
  readonly sku: string;
  readonly quantity: number;
};
