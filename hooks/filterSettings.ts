import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AreaId } from '@/context';
import { AREA_PRESETS } from '@/context';
import type { SpotCategory } from '../types/database';
import type { SpotSortBy } from './spotQuery';
import { isSpotTag } from './spotTags';
import type { TagMatchMode } from './spotTags';

export const FILTER_SETTINGS_KEY = '@datespot/filter-settings';

export type FilterSettings = {
  areaId: AreaId;
  selectedCategory: SpotCategory | null;
  selectedPriceRange: number | null;
  selectedTags: string[];
  tagMatchMode: TagMatchMode;
  searchQuery: string;
  sortBy: SpotSortBy;
};

const SPOT_CATEGORIES: readonly SpotCategory[] = [
  'cafe',
  'restaurant',
  'park',
  'activity',
  'night_view',
  'other',
];

const SORT_OPTIONS: readonly SpotSortBy[] = [
  'default',
  'price_asc',
  'price_desc',
  'name',
];

export const DEFAULT_FILTER_SETTINGS: FilterSettings = {
  areaId: 'shibuya',
  selectedCategory: null,
  selectedPriceRange: null,
  selectedTags: [],
  tagMatchMode: 'and',
  searchQuery: '',
  sortBy: 'default',
};

function isAreaId(value: unknown): value is AreaId {
  return (
    typeof value === 'string' &&
    AREA_PRESETS.some((area) => area.id === value)
  );
}

function isSpotCategory(value: unknown): value is SpotCategory {
  return (
    typeof value === 'string' &&
    (SPOT_CATEGORIES as readonly string[]).includes(value)
  );
}

function isSpotSortBy(value: unknown): value is SpotSortBy {
  return (
    typeof value === 'string' &&
    (SORT_OPTIONS as readonly string[]).includes(value)
  );
}

function isTagMatchMode(value: unknown): value is TagMatchMode {
  return value === 'and' || value === 'or';
}

export function parseFilterSettings(value: unknown): FilterSettings {
  if (typeof value !== 'object' || value === null) {
    return { ...DEFAULT_FILTER_SETTINGS };
  }

  const record = value as Record<string, unknown>;
  const price = record.selectedPriceRange;
  const tags = Array.isArray(record.selectedTags)
    ? record.selectedTags.filter(
        (tag): tag is string => typeof tag === 'string' && isSpotTag(tag),
      )
    : [];

  return {
    areaId: isAreaId(record.areaId)
      ? record.areaId
      : DEFAULT_FILTER_SETTINGS.areaId,
    selectedCategory: isSpotCategory(record.selectedCategory)
      ? record.selectedCategory
      : null,
    selectedPriceRange:
      typeof price === 'number' && price >= 1 && price <= 4
        ? Math.round(price)
        : null,
    selectedTags: tags,
    tagMatchMode: isTagMatchMode(record.tagMatchMode)
      ? record.tagMatchMode
      : 'and',
    searchQuery:
      typeof record.searchQuery === 'string' ? record.searchQuery : '',
    sortBy: isSpotSortBy(record.sortBy)
      ? record.sortBy
      : DEFAULT_FILTER_SETTINGS.sortBy,
  };
}

export async function readFilterSettings(): Promise<FilterSettings | null> {
  try {
    const raw = await AsyncStorage.getItem(FILTER_SETTINGS_KEY);
    if (raw === null) {
      return null;
    }

    return parseFilterSettings(JSON.parse(raw) as unknown);
  } catch (error) {
    console.warn('[DateSpot] フィルター設定の読み込みに失敗', error);
    return null;
  }
}

export async function writeFilterSettings(
  settings: FilterSettings,
): Promise<void> {
  try {
    await AsyncStorage.setItem(FILTER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('[DateSpot] フィルター設定の保存に失敗', error);
  }
}
