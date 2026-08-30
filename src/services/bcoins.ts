import { supabase } from '@/lib/supabase';
import type { BCoinLedgerEntry, BCoinReward, BCoinWallet } from '@/types';

export async function getBCoinWallet(userId: string) {
  const { data, error } = await supabase.from('bcoin_wallets').select('user_id,balance,lifetime_earned,updated_at').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return (data as BCoinWallet | null) ?? { user_id: userId, balance: 0, lifetime_earned: 0, updated_at: new Date(0).toISOString() };
}

export async function listBCoinLedger(userId: string, limit = 20) {
  const { data, error } = await supabase.from('bcoin_ledger').select('id,amount,reason,source_type,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as BCoinLedgerEntry[];
}

export async function listBCoinRewards() {
  const { data, error } = await supabase.from('bcoin_rewards').select('id,title,description,partner_name,cost,image_url,redemption_url,stock').eq('is_active', true).order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as BCoinReward[];
}

export async function redeemBCoinReward(rewardId: string) {
  const { data, error } = await supabase.rpc('redeem_bcoin_reward_v31', { p_reward_id: rewardId });
  if (error) throw error;
  return data as string;
}
