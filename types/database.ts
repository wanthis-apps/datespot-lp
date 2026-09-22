export type SpotCategory = 'cafe' | 'restaurant' | 'park' | 'activity' | 'night_view' | 'other';

export type SpotTag =
  | 'rainy_ok'
  | 'private_room'
  | 'parking'
  | 'credit_card'
  | 'nice_view';

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
  distance_km?: number;
  tags?: string[];
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

export interface Review {
  id: string;
  spot_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  helpful_count: number;
  created_at: string;
}

export interface PlanSpot {
  id: string;
  plan_id: string;
  spot_id: string;
  order_index: number;
  visit_time: string | null;
  spot?: Spot;
}

export interface Plan {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  plan_spots: PlanSpot[];
}

export type NotificationPreferenceKey =
  | 'couponExpiry'
  | 'favoriteReviews'
  | 'planUpdates'
  | 'promotions';

export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;

export type DeleteAccountReason =
  | 'not_using'
  | 'privacy'
  | 'missing_spots'
  | 'too_many_notifications'
  | 'other';

export type FeedbackCategory = 'bug' | 'feature' | 'spot_info' | 'other';

export interface Feedback {
  id: string;
  user_id: string | null;
  category: FeedbackCategory;
  subject: string;
  body: string;
  email: string;
  created_at: string;
}

export type NotificationCategory = 'coupon' | 'system';

export interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
}
