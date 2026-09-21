export type UserRole = 'free' | 'premium';

export type RelationshipStatus =
  | 'first_date'
  | 'new_couple'
  | 'long_term'
  | 'more_than_friends';

export type TimeOfDay = 'day' | 'night';

export type TimeRecommended = TimeOfDay | 'both';

export type SpotCategory =
  | 'cafe'
  | 'activity'
  | 'lunch'
  | 'dinner'
  | 'bar'
  | 'night_view';

export type GeoLocation = {
  lat: number;
  lng: number;
};

export type User = {
  id: string;
  role: UserRole;
  relationshipStatus: RelationshipStatus;
  createdAt: string;
};

export type Spot = {
  id: string;
  name: string;
  location: GeoLocation;
  category: SpotCategory;
  timeRecommended: TimeRecommended;
  relationshipTags: RelationshipStatus[];
  isPartnerStore: boolean;
  imageUrl: string;
  area: string;
  description: string;
  couponDescription: string | null;
};

export type Coupon = {
  id: string;
  spotId: string;
  description: string;
  validUntil: string;
};

export type UserCouponHistory = {
  userId: string;
  couponId: string;
  usedAt: string;
};
