import { supabase } from '@/lib/supabase';
import type { SpotlightItem } from '@/types';

const fields = 'id,slug,kind,title,eyebrow,summary,image_url,link_url,cta_label,partner_name,is_priority,is_sponsored,sort_order,published_at,establishments(id,name,slug,city,cover_image_path)';

export async function listSpotlight() {
  const { data, error } = await supabase
    .from('spotlight_items')
    .select(fields)
    .eq('is_published', true)
    .order('is_priority', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('published_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as SpotlightItem[];
}
