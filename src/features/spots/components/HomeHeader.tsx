import { useState, type ReactElement, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AreaHeader, FittedHeading } from '@/components';
import type { Palette } from '@/theme';
import type { RelationshipStatus, TimeOfDay } from '@/types';
import { RELATIONSHIP_LABELS, RELATIONSHIP_OPTIONS } from '../types';
import { FilterChipRow } from './FilterChipRow';
import { TimeToggle } from './TimeToggle';

type HomeHeaderProps = {
  heading: string;
  timeOfDay: TimeOfDay;
  relationship: RelationshipStatus | null;
  area: string | null;
  areas: string[];
  favoritesOnly: boolean;
  palette: Palette;
  sourceLabel: string;
  canReset: boolean;
  onTimeOfDayChange: (value: TimeOfDay) => void;
  onRelationshipChange: (value: RelationshipStatus | null) => void;
  onAreaChange: (value: string | null) => void;
  onFavoritesOnlyChange: (value: boolean) => void;
  onReset: () => void;
  unreadCount?: number;
  onPressNotifications?: () => void;
  searchBar?: ReactNode;
  filterBar?: ReactNode;
};

export function HomeHeader({
  heading,
  timeOfDay,
  relationship,
  area,
  areas,
  favoritesOnly,
  palette,
  sourceLabel,
  canReset,
  onTimeOfDayChange,
  onRelationshipChange,
  onAreaChange,
  onFavoritesOnlyChange,
  onReset,
  unreadCount = 0,
  onPressNotifications,
  searchBar,
  filterBar,
}: HomeHeaderProps): ReactElement {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterSummary = [
    area ?? 'エリアすべて',
    favoritesOnly ? 'お気に入り' : null,
    relationship !== null ? RELATIONSHIP_LABELS[relationship] : null,
  ]
    .filter((item): item is string => item !== null)
    .join(' ・ ');

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.topRow}>
        <Text style={[styles.kicker, { color: palette.primary }]}>DateSpot</Text>
        {onPressNotifications !== undefined ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="お知らせを開く"
            onPress={onPressNotifications}
            style={[styles.bell, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <Ionicons name="notifications-outline" size={18} color={palette.text} />
            {unreadCount > 0 ? (
              <View style={[styles.badge, { backgroundColor: palette.primary }]}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : String(unreadCount)}
                </Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}
      </View>
      <FittedHeading style={[styles.heading, { color: palette.text }]}>
        {heading}
      </FittedHeading>
      <AreaHeader palette={palette} />
      <Text style={[styles.source, { color: palette.textSecondary }]}>
        データソース: {sourceLabel}
      </Text>
      {searchBar}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: filtersOpen }}
        onPress={() => setFiltersOpen((open) => !open)}
        style={[styles.filterToggle, { backgroundColor: palette.surface, borderColor: palette.border }]}
      >
        <View style={styles.filterToggleText}>
          <Text style={[styles.filterToggleLabel, { color: palette.text }]}>
            絞り込み
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.filterToggleSummary, { color: palette.textSecondary }]}
          >
            {filterSummary}
          </Text>
        </View>
        <Ionicons
          name={filtersOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={palette.textSecondary}
        />
      </Pressable>
      {filtersOpen ? (
        <>
      <TimeToggle
        value={timeOfDay}
        onChange={onTimeOfDayChange}
        palette={palette}
      />
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>
          お気に入り
        </Text>
        <FilterChipRow
          value={favoritesOnly ? 'favorites' : 'all'}
          onChange={(value) => onFavoritesOnlyChange(value === 'favorites')}
          palette={palette}
          options={[
            { value: 'all', label: 'すべて' },
            { value: 'favorites', label: '♥ お気に入り' },
          ]}
        />
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>
          エリア
        </Text>
        <FilterChipRow
          value={area}
          onChange={onAreaChange}
          palette={palette}
          options={[
            { value: null, label: 'すべて' },
            ...areas.map((item) => ({ value: item, label: item })),
          ]}
        />
      </View>
      {filterBar}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>
          関係性
        </Text>
        <FilterChipRow
          value={relationship}
          onChange={onRelationshipChange}
          palette={palette}
          options={[
            { value: null, label: 'すべて' },
            ...RELATIONSHIP_OPTIONS.map((item) => ({
              value: item,
              label: RELATIONSHIP_LABELS[item],
            })),
          ]}
        />
      </View>
      {canReset ? (
        <Pressable accessibilityRole="button" onPress={onReset}>
          <Text style={[styles.reset, { color: palette.primary }]}>
            条件をリセット
          </Text>
        </Pressable>
      ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
  },
  source: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: -8,
  },
  filterToggle: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterToggleText: {
    flex: 1,
    gap: 2,
  },
  filterToggleLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  filterToggleSummary: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  reset: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
});
