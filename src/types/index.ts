export type KycStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export type AssetType = 'stock' | 'crypto';

export type OrderSide = 'buy' | 'sell';

export type TransactionStatus = 'pending' | 'filled' | 'cancelled' | 'failed';

export interface Profile {
  id: string;
  full_name: string | null;
  kyc_status: KycStatus;
  kyc_verified_at: string | null;
  referral_code: string;
  referred_by: string | null;
  cash_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Holding {
  id: string;
  user_id: string;
  symbol: string;
  asset_type: AssetType;
  quantity: number;
  avg_cost: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  symbol: string;
  asset_type: AssetType;
  side: OrderSide;
  quantity: number;
  price: number;
  total_amount: number;
  commission: number;
  commission_rate: number;
  status: TransactionStatus;
  external_order_id: string | null;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  reward_paid: boolean;
  reward_paid_at: string | null;
  created_at: string;
}

export interface CommissionResult {
  tradeAmount: number;
  rate: number;
  commission: number;
  total: number;
}
