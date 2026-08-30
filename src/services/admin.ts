import { supabase } from '@/lib/supabase';
import type { AppRole } from '@/types';

export type AdminPlace = { id:string; name:string; city:string; address_line:string|null; publish_status:string; public_status:string; created_at:string };
export type AdminContribution = { id:string; establishment_id:string; title:string|null; body:string; status:string; created_at:string };
export type AdminReport = { id:string; target_type:string; target_id:string; reason:string; details:string|null; status:string; created_at:string };
export type AdminUser = { user_id:string; email:string; display_name:string; role:AppRole; created_at:string };
export type AdminSnapshot = { places:AdminPlace[]; contributions:AdminContribution[]; reports:AdminReport[]; users:AdminUser[] };

export async function loadAdminSnapshot(role: AppRole): Promise<AdminSnapshot> {
  const [placesResult, contributionsResult, reportsResult] = await Promise.all([
    supabase.from('establishments').select('id,name,city,address_line,publish_status,public_status,created_at').order('created_at', { ascending:false }).limit(200),
    supabase.from('contributions').select('id,establishment_id,title,body,status,created_at').order('created_at', { ascending:false }).limit(200),
    supabase.from('reports').select('id,target_type,target_id,reason,details,status,created_at').order('created_at', { ascending:false }).limit(200),
  ]);
  const error = placesResult.error ?? contributionsResult.error ?? reportsResult.error;
  if (error) throw error;
  let users: AdminUser[] = [];
  if (role === 'admin') {
    const result = await supabase.rpc('admin_list_users_v28');
    if (result.error) throw result.error;
    users = (result.data ?? []) as AdminUser[];
  }
  return {
    places: (placesResult.data ?? []) as AdminPlace[],
    contributions: (contributionsResult.data ?? []) as AdminContribution[],
    reports: (reportsResult.data ?? []) as AdminReport[],
    users,
  };
}

async function reviewerId() { const { data } = await supabase.auth.getUser(); return data.user?.id ?? null; }
export async function updateAdminPlace(id:string, patch:Record<string,unknown>) {
  const { error } = await supabase.from('establishments').update({ ...patch, reviewed_by: await reviewerId(), reviewed_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}
export async function deleteAdminPlace(id:string) { const { error } = await supabase.from('establishments').delete().eq('id', id); if (error) throw error; }
export async function updateAdminContribution(id:string, status:string) {
  const { error } = await supabase.from('contributions').update({ status, published_at: status === 'approved' ? new Date().toISOString() : null }).eq('id', id); if (error) throw error;
}
export async function deleteAdminContribution(id:string) { const { error } = await supabase.from('contributions').delete().eq('id', id); if (error) throw error; }
export async function updateAdminReport(id:string, status:string) {
  const actor = await reviewerId();
  const { error } = await supabase.from('reports').update({ status, assigned_to: status === 'in_review' ? actor : undefined, resolved_at: ['resolved','dismissed'].includes(status) ? new Date().toISOString() : null }).eq('id', id); if (error) throw error;
}
export async function deleteAdminReport(id:string) { const { error } = await supabase.from('reports').delete().eq('id', id); if (error) throw error; }
export async function setAdminUserRole(userId:string, role:'member'|'moderator') { const { error } = await supabase.rpc('admin_set_user_role_v28', { p_user_id:userId, p_role:role }); if (error) throw error; }
