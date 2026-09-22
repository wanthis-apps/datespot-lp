import type { Spot, SpotTag } from '../types/database';

export type TagMatchMode = 'and' | 'or';

export type SpotTagOption = {
  value: SpotTag;
  label: string;
  emoji: string;
};

export const SPOT_TAG_OPTIONS: readonly SpotTagOption[] = [
  { value: 'rainy_ok', label: '雨の日でも楽しめる', emoji: '☔' },
  { value: 'private_room', label: '個室あり', emoji: '🚪' },
  { value: 'parking', label: '駐車場あり', emoji: '🅿️' },
  { value: 'credit_card', label: 'クレジットカード可', emoji: '💳' },
  { value: 'nice_view', label: '景色・夜景がきれい', emoji: '🌅' },
];

const SPOT_TAG_VALUES: readonly SpotTag[] = SPOT_TAG_OPTIONS.map(
  (option) => option.value,
);

const CATALOG_SPOT_TAGS: Record<string, readonly SpotTag[]> = {
  'spot-daikanyama-bloom': ['rainy_ok', 'credit_card', 'nice_view'],
  'spot-ebisu-olive': ['rainy_ok', 'private_room', 'credit_card'],
  'spot-inokashira-boat': ['parking', 'nice_view'],
  'spot-omotesando-sun': ['credit_card', 'nice_view'],
  'spot-nakameguro-river': ['credit_card', 'nice_view'],
  'spot-shibuya-italiano': ['rainy_ok', 'private_room', 'credit_card'],
  'spot-roppongi-star': ['rainy_ok', 'credit_card', 'nice_view'],
  'spot-ebisu-lueur': ['rainy_ok', 'credit_card'],
  'spot-tokyo-tower': ['rainy_ok', 'credit_card', 'nice_view'],
  'spot-odaiba-rainbow': ['parking', 'nice_view'],
};

export function isSpotTag(value: string): value is SpotTag {
  return (SPOT_TAG_VALUES as readonly string[]).includes(value);
}

export function normalizeSpotTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item !== 'string') {
      return [];
    }
    const trimmed = item.trim();
    return isSpotTag(trimmed) ? [trimmed] : [];
  });
}

export function tagsForCatalogSpotId(spotId: string): string[] {
  const tags = CATALOG_SPOT_TAGS[spotId];
  return tags === undefined ? [] : [...tags];
}

export function matchesSelectedTags(
  spot: Pick<Spot, 'tags'>,
  selectedTags: readonly string[],
  mode: TagMatchMode,
): boolean {
  if (selectedTags.length === 0) {
    return true;
  }

  const tags = spot.tags ?? [];
  if (mode === 'and') {
    return selectedTags.every((tag) => tags.includes(tag));
  }

  return selectedTags.some((tag) => tags.includes(tag));
}

export function formatSpotTagLabel(tag: string): string {
  const option = SPOT_TAG_OPTIONS.find((item) => item.value === tag);
  if (option === undefined) {
    return tag;
  }

  return `${option.emoji} ${option.label}`;
}
