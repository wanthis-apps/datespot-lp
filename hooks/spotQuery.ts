import type { Spot } from '../types/database';

export type SpotSortBy = 'default' | 'price_asc' | 'price_desc' | 'name';

export function matchesSearchQuery(spot: Spot, searchQuery: string): boolean {
  const normalized = searchQuery.trim().toLowerCase();
  if (normalized.length === 0) {
    return true;
  }

  const name = spot.name.toLowerCase();
  const description = (spot.description ?? '').toLowerCase();
  const address = (spot.address ?? '').toLowerCase();

  return (
    name.includes(normalized) ||
    description.includes(normalized) ||
    address.includes(normalized)
  );
}

function compareByName(left: Spot, right: Spot): number {
  return left.name.localeCompare(right.name, 'ja');
}

export function compareSpots(
  left: Spot,
  right: Spot,
  sortBy: SpotSortBy,
): number {
  if (sortBy === 'name') {
    return compareByName(left, right);
  }

  if (sortBy === 'price_asc' || sortBy === 'price_desc') {
    const leftPrice = left.price_range;
    const rightPrice = right.price_range;

    if (leftPrice === null && rightPrice === null) {
      return compareByName(left, right);
    }
    if (leftPrice === null) {
      return 1;
    }
    if (rightPrice === null) {
      return -1;
    }

    const diff =
      sortBy === 'price_asc' ? leftPrice - rightPrice : rightPrice - leftPrice;
    if (diff !== 0) {
      return diff;
    }

    return compareByName(left, right);
  }

  return 0;
}

export function applySearchAndSort(
  spots: readonly Spot[],
  searchQuery: string,
  sortBy: SpotSortBy,
): Spot[] {
  const filtered = spots.filter((spot) => matchesSearchQuery(spot, searchQuery));
  if (sortBy === 'default') {
    return filtered;
  }

  return [...filtered].sort((left, right) => compareSpots(left, right, sortBy));
}
