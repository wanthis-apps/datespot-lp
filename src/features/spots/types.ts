import type { RelationshipStatus, SpotCategory, TimeOfDay } from '@/types';

export const RELATIONSHIP_LABELS: Record<RelationshipStatus, string> = {
  first_date: '初デート',
  new_couple: '付き合いたて',
  long_term: '長年カップル',
  more_than_friends: '友人以上',
};

export const RELATIONSHIP_OPTIONS: RelationshipStatus[] = [
  'first_date',
  'new_couple',
  'long_term',
  'more_than_friends',
];

export const CATEGORY_OPTIONS: SpotCategory[] = [
  'cafe',
  'activity',
  'lunch',
  'dinner',
  'bar',
  'night_view',
];

export const CATEGORY_LABELS: Record<SpotCategory, string> = {
  cafe: 'カフェ',
  activity: 'アクティビティ',
  lunch: 'ランチ',
  dinner: 'ディナー',
  bar: 'バー',
  night_view: '夜景',
};

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  day: '昼',
  night: '夜',
};

export const TIME_RECOMMENDED_LABELS: Record<
  'day' | 'night' | 'both',
  string
> = {
  day: '昼向き',
  night: '夜向き',
  both: '昼夜OK',
};
