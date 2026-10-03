import { useState, type ReactElement } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ErrorState, FittedHeading, SpotCardSkeleton } from '@/components';
import { useAppTheme } from '@/context';
import { usePlans } from '../../hooks/usePlans';
import { sharePlan } from '@/utils/share';
import type { TabScreenProps } from '@/navigation/types';
import type { Plan } from '../../types/database';
import { EmptyState } from './components/EmptyState';
import { PlanCard } from './components/PlanCard';
import { PlanCreateModal } from './components/PlanCreateModal';

type PlansScreenProps = TabScreenProps<'Plans'>;

export function PlansScreen(_props: PlansScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { isDark, palette } = useAppTheme();
  const { plans, loading, saving, error, createPlan, deletePlan, refetch } =
    usePlans();
  const [createVisible, setCreateVisible] = useState(false);

  const handleShare = (plan: Plan): void => {
    void sharePlan(plan).then((result) => {
      if (!result.ok) {
        Alert.alert('共有できませんでした', result.message);
      }
    });
  };

  const handleDelete = (plan: Plan): void => {
    Alert.alert(
      'プランを削除しますか？',
      `「${plan.title}」を削除します。この操作は元に戻せません。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: () => {
            void deletePlan(plan.id);
          },
        },
      ],
    );
  };

  const screenStyle = [
    styles.screen,
    {
      backgroundColor: palette.background,
      paddingTop: insets.top + 8,
    },
  ];

  if (loading && plans.length === 0) {
    return (
      <View style={screenStyle}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: palette.primary }]}>Plans</Text>
            <FittedHeading style={[styles.heading, { color: palette.text }]}>
              デートプラン
            </FittedHeading>
          </View>
          <View style={styles.skeletonList}>
            <SpotCardSkeleton palette={palette} />
            <SpotCardSkeleton palette={palette} />
          </View>
        </View>
      </View>
    );
  }

  if (error !== null && plans.length === 0) {
    return (
      <View style={screenStyle}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ErrorState
          palette={palette}
          message={error}
          onRetry={() => {
            void refetch();
          }}
        />
      </View>
    );
  }

  return (
    <View style={screenStyle}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
          plans.length === 0 ? styles.emptyContent : null,
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: palette.primary }]}>Plans</Text>
            <FittedHeading style={[styles.heading, { color: palette.text }]}>
              デートプラン
            </FittedHeading>
            <Text style={[styles.lead, { color: palette.textSecondary }]}>
              {'気になるスポットを組み合わせて、\n自分だけのデートコースを残せます。'}
            </Text>
            <Button
              label="新しいプランを作る"
              palette={palette}
              onPress={() => setCreateVisible(true)}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            palette={palette}
            icon="map-outline"
            title="プランはまだありません"
            message={'「新しいプランを作る」から、\nお気に入りのスポットを並べてみましょう。'}
          />
        }
        renderItem={({ item }) => (
          <PlanCard
            plan={item}
            palette={palette}
            onShare={() => handleShare(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
      />
      <PlanCreateModal
        visible={createVisible}
        palette={palette}
        saving={saving}
        onClose={() => setCreateVisible(false)}
        onSave={async (input) => {
          const result = await createPlan(input);
          if (result.ok) {
            Alert.alert('保存しました', result.message);
          }
          return result;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  emptyContent: {
    flexGrow: 1,
  },
  header: {
    gap: 8,
    marginBottom: 20,
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
  lead: {
    fontSize: 14,
    lineHeight: 22,
  },
  separator: {
    height: 14,
  },
  skeletonList: {
    gap: 14,
  },
});
