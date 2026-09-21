import { type ReactElement } from 'react';
import type { Palette } from '@/theme';
import type { RelationshipStatus } from '@/types';
import { RELATIONSHIP_LABELS, RELATIONSHIP_OPTIONS } from '../types';
import { FilterChipRow } from './FilterChipRow';

type RelationshipFilterProps = {
  value: RelationshipStatus | null;
  onChange: (value: RelationshipStatus | null) => void;
  palette: Palette;
};

export function RelationshipFilter({
  value,
  onChange,
  palette,
}: RelationshipFilterProps): ReactElement {
  return (
    <FilterChipRow
      value={value}
      onChange={onChange}
      palette={palette}
      options={[
        { value: null, label: 'すべて' },
        ...RELATIONSHIP_OPTIONS.map((option) => ({
          value: option,
          label: RELATIONSHIP_LABELS[option],
        })),
      ]}
    />
  );
}
