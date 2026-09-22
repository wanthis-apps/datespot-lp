import { useCallback, useMemo, useState } from 'react';
import type { Spot } from '../types/database';

export type UseFavoriteBulkResult = {
  editing: boolean;
  selectedIds: string[];
  selectedSpots: Spot[];
  selectedCount: number;
  enterEdit: () => void;
  exitEdit: () => void;
  toggleSelect: (spotId: string) => void;
};

export function useFavoriteBulk(spots: Spot[]): UseFavoriteBulkResult {
  const [editing, setEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedSpots = useMemo(
    () => spots.filter((spot) => selectedIdSet.has(spot.id)),
    [selectedIdSet, spots],
  );

  const enterEdit = useCallback((): void => {
    setEditing(true);
  }, []);

  const exitEdit = useCallback((): void => {
    setEditing(false);
    setSelectedIds([]);
  }, []);

  const toggleSelect = useCallback((spotId: string): void => {
    setSelectedIds((current) =>
      current.includes(spotId)
        ? current.filter((id) => id !== spotId)
        : [...current, spotId],
    );
  }, []);

  return {
    editing,
    selectedIds,
    selectedSpots,
    selectedCount: selectedSpots.length,
    enterEdit,
    exitEdit,
    toggleSelect,
  };
}
