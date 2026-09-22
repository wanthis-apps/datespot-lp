export type SpotCategory = 'cafe' | 'restaurant' | 'park' | 'activity' | 'night_view' | 'other';

export interface Spot {
  id: string;
  name: string;
  description: string | null;
  category: SpotCategory;
  address: string | null;
  latitude: number;
  longitude: number;
  price_range: number | null; // 1: ~1000円, 2: ~3000円, 3: ~5000円, 4: 5000円~
  image_url: string | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  spot_id: string;
  title: string;
  discount_detail: string;
  valid_until: string;
  created_at: string;
  spot?: Pick<Spot, 'name' | 'image_url'>;
}

export interface Favorite {
  id: string;
  user_id: string;
  spot_id: string;
  created_at: string;
}
