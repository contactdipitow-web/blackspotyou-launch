import { supabase } from '@/lib/supabase';

export type ReportReason =
  | 'false_information'
  | 'harassment'
  | 'hate_or_discrimination'
  | 'privacy'
  | 'spam'
  | 'conflict_of_interest'
  | 'illegal_content'
  | 'other';

export async function reportEstablishment(
  reporterUserId: string,
  establishmentId: string,
  reason: ReportReason,
  details: string,
) {
  const { error } = await supabase.from('reports').insert({
    reporter_user_id: reporterUserId,
    target_type: 'establishment',
    target_id: establishmentId,
    reason,
    details: details.trim() || null,
    status: 'open',
  });
  if (error) throw error;
}
