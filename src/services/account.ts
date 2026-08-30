import { supabase } from '@/lib/supabase';
import type { AppRole, Establishment } from '@/types';

const favoriteFields = 'establishments(id,name,slug,category_id,description,address_line,postal_code,city,country_code,latitude,longitude,google_place_id,cover_image_path,website_url,phone,public_status,ownership_context,community_context,created_at,establishment_categories(label,slug))';
export async function getRole(userId: string): Promise<AppRole> {
  const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle();
  return (data?.role as AppRole | undefined) ?? 'member';
}
export async function listFavorites(userId: string) {
  const { data, error } = await supabase.from('favorites').select(favoriteFields).eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((row: any) => row.establishments).filter(Boolean) as Establishment[];
}
export async function isFavorite(userId: string, establishmentId: string) {
  const { data } = await supabase.from('favorites').select('establishment_id').eq('user_id', userId).eq('establishment_id', establishmentId).maybeSingle();
  return Boolean(data);
}
export async function setFavorite(userId: string, establishmentId: string, value: boolean) {
  const result = value ? await supabase.from('favorites').insert({ user_id: userId, establishment_id: establishmentId }) : await supabase.from('favorites').delete().eq('user_id', userId).eq('establishment_id', establishmentId);
  if (result.error) throw result.error;
}
export async function deleteAccount() {
  const { data, error } = await supabase.functions.invoke<{ deleted?: boolean; error?: string }>('delete-account', { body: {} });
  if (error) throw error;
  if (!data?.deleted) {
    if (data?.error === 'admin_transfer_required') throw new Error('admin_transfer_required');
    throw new Error(data?.error ?? 'account_deletion_failed');
  }
  await supabase.auth.signOut({ scope: 'local' });
}
