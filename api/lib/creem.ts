import { createCreem } from 'creem_io';

type CreemClient = ReturnType<typeof createCreem>;

let _creem: CreemClient | null = null;

export function getCreem(): CreemClient {
  if (!_creem) {
    _creem = createCreem({
      apiKey: process.env.CREEM_API_KEY!,
      testMode: process.env.CREEM_TEST_MODE === 'true',
    });
  }
  return _creem;
}

export type CreemEventType =
  | "checkout.completed"
  | "refund.created"
  | "subscription.active"
  | "subscription.trialing"
  | "subscription.canceled"
  | "subscription.paid"
  | "subscription.expired"
  | "subscription.unpaid"
  | "subscription.update";

export interface CreemCustomer {
  id: string;
  object: "customer";
  email: string;
  name: string;
  country: string;
  created_at: string;
  updated_at: string;
  mode: string;
}

export interface CreemProduct {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  price: number;
  currency: string;
  billing_type: "recurring" | "one_time";
  billing_period?: string;
  status: "active" | "inactive";
  tax_mode: "inclusive" | "exclusive";
  tax_category: string;
  default_success_url: string;
  created_at: string;
  updated_at: string;
  mode: string;
  metadata?: {
    credits?: number;
    product_type?: "subscription" | "credits";
  };
}

export interface CreemSubscription {
  id: string;
  object: "subscription";
  product: string | CreemProduct;
  customer: string | CreemCustomer;
  collection_method: "charge_automatically";
  status: "active" | "canceled" | "expired";
  canceled_at: string | null;
  current_period_start_date?: string;
  current_period_end_date?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  mode: string;
}

export interface CreemOrder {
  id: string;
  customer: string;
  product: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  type: "recurring" | "one_time";
  created_at: string;
  updated_at: string;
  mode: string;
  metadata: {
    user_id: string;
    product_type: "subscription" | "credits";
    credits?: number;
  };
}

export interface CreemCheckout {
  id: string;
  object: "checkout";
  request_id: string;
  order: CreemOrder;
  product: CreemProduct;
  customer: CreemCustomer;
  subscription?: CreemSubscription;
  custom_fields: any[];
  status: "completed" | "pending" | "failed";
  metadata?: Record<string, any>;
  mode: string;
}

export interface CreemWebhookEvent {
  id: string;
  eventType: CreemEventType;
  created_at: number;
  object: CreemCheckout | CreemSubscription | any;
  mode: string;
}