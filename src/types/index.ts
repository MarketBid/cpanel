export interface SocialLink {
  name: string;
  value: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  contact: string;
  rating: number;
  total_ratings: number;
  date_of_birth?: string;
  location?: string;
  is_business: boolean;
  social_media_links?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    whatsapp?: string;
  };
  social_links?: SocialLink[];
  business_category?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export enum TransactionStatus {
  PENDING = "pending",
  PAID = "paid",
  IN_TRANSIT = "intransit",
  DELIVERED = "delivered",
  COMPLETED = "completed",
  DISPUTED = "disputed",
  CANCELLED = "cancelled"
}

export enum ContractType {
  TIME_BASED = "time_based",
  MILESTONE_BASED = "milestone_based"
}

export interface Milestone {
  id: string;
  description: string;
  amount_percentage: number;
  due_date: string;
  completion_condition: string;
  status?: 'pending' | 'completed' | 'paid';
}

export enum RefundPolicyType {
  FULL_REFUND = "full_refund",
  CONDITIONAL_REFUND = "conditional_refund",
  PARTIAL_FIXED = "partial_fixed",
  NO_REFUND = "no_refund",
  CUSTOM_TERMS = "custom_terms"
}

export interface RefundPolicy {
  type: RefundPolicyType;
  description?: string; // For custom terms or specific conditions
  refund_percentage?: number; // For partial fixed
  conditions?: string[]; // For conditional refund
}

export interface FeeConfig {
  refund_processing_fee_percentage?: number; // e.g., 5
  refund_fee_payer: 'sender' | 'receiver' | 'split';
  cancellation_fee_percentage?: number; // e.g., 10
}



export interface Transaction {
  id: number;
  transaction_id: string;
  title: string;
  description: string;
  amount: number;
  sender_id: number;
  receiver_id?: number;
  sender?: User;
  receiver?: User;
  status: TransactionStatus;
  payment_code: string;
  payment_link?: string;
  created_at: string;
  updated_at: string;
  contract_type?: ContractType;
  milestones?: Milestone[];
  time_based_config?: {
    completion_date: string;
    completion_time: string;
    auto_completion_buffer_hours: number;
  };
  refund_policy?: RefundPolicy;
  fee_config?: FeeConfig;
}



export enum AccountType {
  MOMO = "momo",
  BANK = "bank"
}

export interface Account {
  id: number;
  user_id: number;
  type: AccountType;
  name: string;
  number: string;
  service_provider: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  refresh_token?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  contact: string;
  is_business: boolean;
  business_category?: string;
  social_media_links?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    whatsapp?: string;
  };
}

export const BUSINESS_CATEGORIES = [
  'Fashion & Clothing',
  'Electronics & Gadgets',
  'Food & Beverages',
  'Beauty & Cosmetics',
  'Home & Garden',
  'Sports & Fitness',
  'Books & Media',
  'Handmade & Crafts',
  'Automotive',
  'Services',
  'Other'
];