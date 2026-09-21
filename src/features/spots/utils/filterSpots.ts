import type { RelationshipStatus, Spot, SpotCategory, TimeOfDay } from '@/types';

export type SpotFilterCriteria = {
  timeOfDay: TimeOfDay;
  relationship: RelationshipStatus | null;
  area: string | null;
  category: SpotCategory | null;
  query: string;
  favoritesOnly: boolean;
  favoriteSpotIds: readonly string[];
};

export function matchesTimeOfDay(spot: Spot, timeOfDay: TimeOfDay): boolean {
  return spot.timeRecommended === 'both' || spot.timeRecommended === timeOfDay;
}

function matchesQuery(spot: Spot, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) {
    return true;
  }

  return (
    spot.name.toLowerCase().includes(normalized) ||
    spot.area.toLowerCase().includes(normalized) ||
    spot.description.toLowerCase().includes(normalized)
  );
}

export function filterSpots(
  spots: Spot[],
  criteria: SpotFilterCriteria,
): Spot[] {
  const favoriteSet = new Set(criteria.favoriteSpotIds);

  return spots.filter((spot) => {
    if (!matchesTimeOfDay(spot, criteria.timeOfDay)) {
      return false;
    }

    if (
      criteria.relationship !== null &&
      !spot.relationshipTags.includes(criteria.relationship)
    ) {
      return false;
    }

    if (criteria.area !== null && spot.area !== criteria.area) {
      return false;
    }

    if (criteria.category !== null && spot.category !== criteria.category) {
      return false;
    }

    if (!matchesQuery(spot, criteria.query)) {
      return false;
    }

    if (criteria.favoritesOnly && !favoriteSet.has(spot.id)) {
      return false;
    }

    return true;
  });
}

export function collectAreas(spots: Spot[]): string[] {
  const areas = new Set(spots.map((spot) => spot.area));
  return [...areas].sort((left, right) => left.localeCompare(right, 'ja'));
}

export function hasFreeCoupon(
  spot: Spot,
): spot is Spot & { couponDescription: string } {
  return spot.couponDescription !== null;
}
