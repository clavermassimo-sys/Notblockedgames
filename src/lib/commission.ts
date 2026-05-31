import type { CommissionResult } from '../types';

/**
 * Commission schedule:
 *   < $500  → 10%
 *   ≥ $500  → 1%
 */
export function calculateCommission(tradeAmount: number): CommissionResult {
  const rate = tradeAmount < 500 ? 0.10 : 0.01;
  const commission = +(tradeAmount * rate).toFixed(2);
  const total = +(tradeAmount + commission).toFixed(2);
  return { tradeAmount, rate, commission, total };
}

export function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(0)}%`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(2)}K`;
  }
  return formatCurrency(amount);
}
