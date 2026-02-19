export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}
export interface OrderDTO {
  userId: string;
  productId: string;
  quantity: number;
  amount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OutboxEvent {
  id: string;
  aggregate_id: string;
  aggregate_type: string;
  event_type: string;
  payload: any;
  created_at: string;
}
