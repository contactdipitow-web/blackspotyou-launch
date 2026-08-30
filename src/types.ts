export type AppRole = 'member' | 'moderator' | 'admin';
export type Category = { id: number; slug: string; label: string; icon_name: string | null };
export type Establishment = {
  id: string;
  name: string;
  slug: string;
  category_id?: number | null;
  description: string | null;
  address_line: string | null;
  postal_code: string | null;
  city: string;
  country_code: string;
  latitude: number;
  longitude: number;
  google_place_id?: string | null;
  cover_image_path: string | null;
  website_url: string | null;
  phone: string | null;
  public_status: 'unclassified'|'good_spot'|'watchlist'|'red_flag'|'community_recommended'|'under_review'|'incident_documented';
  ownership_context: string;
  community_context: string | null;
  created_at: string;
  establishment_categories: Pick<Category,'label'|'slug'> | null;
};

export type SpotlightKind = 'favorite' | 'partner' | 'event' | 'news' | 'sponsored';
export type SpotlightItem = {
  id: string;
  slug: string;
  kind: SpotlightKind;
  title: string;
  eyebrow: string | null;
  summary: string | null;
  image_url: string | null;
  link_url: string | null;
  cta_label: string | null;
  partner_name: string | null;
  is_priority: boolean;
  is_sponsored: boolean;
  sort_order: number;
  published_at: string | null;
  establishments: Pick<Establishment, 'id'|'name'|'slug'|'city'|'cover_image_path'> | null;
};

export type BCoinWallet = { user_id: string; balance: number; lifetime_earned: number; updated_at: string };
export type BCoinLedgerEntry = { id: string; amount: number; reason: string; source_type: string; created_at: string };
export type BCoinReward = { id: string; title: string; description: string | null; partner_name: string | null; cost: number; image_url: string | null; redemption_url: string | null; stock: number | null };
