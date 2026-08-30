import { supabase } from '@/lib/supabase';
import type { Category, Establishment } from '@/types';

const fields = 'id,name,slug,category_id,description,address_line,postal_code,city,country_code,latitude,longitude,google_place_id,cover_image_path,website_url,phone,public_status,ownership_context,community_context,created_at,establishment_categories(label,slug)';

export async function listPlaces({ query = '', categoryIds = [], from = 0, limit = 20 }: { query?: string; categoryIds?: number[]; from?: number; limit?: number } = {}) {
  let request = supabase.from('establishments').select(fields).eq('publish_status', 'published').order('created_at', { ascending: false }).range(from, from + limit - 1);
  if (query.trim()) request = request.or(`name.ilike.%${query.trim()}%,city.ilike.%${query.trim()}%,address_line.ilike.%${query.trim()}%`);
  if (categoryIds.length) request = request.in('category_id', categoryIds);
  const { data, error } = await request;
  if (error) throw error;
  return (data ?? []) as unknown as Establishment[];
}

export async function getPlace(slug: string) {
  const { data, error } = await supabase.from('establishments').select(fields).eq('slug', slug).eq('publish_status', 'published').single();
  if (error) throw error;
  return data as unknown as Establishment;
}

export async function listCategories() {
  const { data, error } = await supabase.from('establishment_categories').select('id,slug,label,icon_name').eq('is_active', true).order('sort_order');
  if (error) throw error;
  return (data ?? []) as Category[];
}

export type PlaceProposal = Pick<Establishment,'name'|'address_line'|'postal_code'|'city'|'country_code'|'latitude'|'longitude'> & {
  category_id: number; description?: string; experience_type: 'positive'|'mixed'|'negative'|'incident'|'update';
  visit_date: string; title?: string; body: string; is_anonymous: boolean; contact_consent: boolean;
};

export async function proposePlace(input: PlaceProposal) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Connectez-vous pour proposer un lieu.');
  const { data, error } = await supabase.rpc('submit_place_draft_v13', {
    p_name: input.name, p_category_id: input.category_id, p_description: input.description || null,
    p_address_line: input.address_line, p_postal_code: input.postal_code || null, p_city: input.city,
    p_country_code: input.country_code, p_latitude: input.latitude, p_longitude: input.longitude,
    p_google_place_id: null, p_website_url: null, p_phone: null, p_community_context: null,
    p_ownership_context: 'unknown', p_experience_type: input.experience_type, p_visit_date: input.visit_date,
    p_title: input.title || null, p_body: input.body, p_is_anonymous: input.is_anonymous,
    p_contact_consent: input.contact_consent,
  });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as { contribution_id?: string } | null;
  if (!row?.contribution_id) throw new Error('La soumission n’a pas retourné de contribution.');
  const finalized = await supabase.rpc('finalize_contribution_draft_v13', { p_contribution_id: row.contribution_id });
  if (finalized.error) throw finalized.error;
}
