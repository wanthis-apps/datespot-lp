import { useMemo, useState, type ReactElement } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCouponList } from '../../hooks/useCouponList';
import {
  FOUNDATION_CATEGORY_LABELS,
  formatPriceRange,
  formatValidUntil,
} from '../../hooks/mapRecords';
import { useFavorites } from '@/features/spots/hooks/useFavorites';
import type { Palette } from '@/theme';
import type { Coupon, Spot } from '../../types/database';
import { Button } from './Button';
import { RemoteImage } from './RemoteImage';

export type SpotDetailModalProps = {
  visible: boolean;
  spot: Spot | null;
  palette: Palette;
  onClose: () => void;
};

export function SpotDetailModal({
  visible,
  spot,
  palette,
  onClose,
}: SpotDetailModalProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { coupons } = useCouponList();
  const [showCoupons, setShowCoupons] = useState(false);

  const relatedCoupons = useMemo(() => {
    if (spot === null) {
      return [];
    }

    return coupons.filter((coupon) => coupon.spot_id === spot.id);
  }, [coupons, spot]);

  const favorited = spot !== null && isFavorite(spot.id);

  const handleToggleFavorite = (): void => {
    if (spot === null) {
      return;
    }

    void toggleFavorite(spot.id);
  };

  const handleShowCoupons = (): void => {
    setShowCoupons(true);
  };

  const handleUseCoupon = (coupon: Coupon): void => {
    Alert.alert(
      'クーポンを使用しますか？',
      `${coupon.title}\n${coupon.discount_detail}`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '使用する',
          onPress: () => {
            console.log('[DateSpot] coupon use from modal (dummy)', coupon.id);
            Alert.alert(
              '利用を受け付けました',
              'この操作は画面確認用のダミーアクションです。',
            );
          },
        },
      ],
    );
  };

  const handleClose = (): void => {
    setShowCoupons(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      onDismiss={() => setShowCoupons(false)}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="詳細を閉じる"
          style={styles.backdrop}
          onPress={handleClose}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: palette.surface,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: palette.border }]} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="閉じる"
            onPress={handleClose}
            style={[styles.close, { backgroundColor: palette.background }]}
          >
            <Ionicons name="close" size={18} color={palette.text} />
          </Pressable>

          {spot === null ? null : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              <RemoteImage
                uri={spot.image_url}
                style={styles.image}
                accessibilityLabel={spot.name}
              />
              <View style={styles.tags}>
                <View
                  style={[styles.tag, { backgroundColor: palette.primaryMuted }]}
                >
                  <Text style={[styles.tagText, { color: palette.primary }]}>
                    {FOUNDATION_CATEGORY_LABELS[spot.category]}
                  </Text>
                </View>
                <View style={[styles.tag, { backgroundColor: palette.coupon }]}>
                  <Text style={[styles.tagText, { color: palette.couponText }]}>
                    {formatPriceRange(spot.price_range)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.name, { color: palette.text }]}>
                {spot.name}
              </Text>
              {spot.address !== null ? (
                <View style={styles.metaRow}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={palette.muted}
                  />
                  <Text style={[styles.address, { color: palette.textSecondary }]}>
                    {spot.address}
                  </Text>
                </View>
              ) : null}
              {spot.description !== null ? (
                <Text style={[styles.description, { color: palette.textSecondary }]}>
                  {spot.description}
                </Text>
              ) : null}

              <View style={styles.actions}>
                <Button
                  label={favorited ? 'お気に入り解除' : 'お気に入り追加'}
                  onPress={handleToggleFavorite}
                  palette={palette}
                  variant={favorited ? 'ghost' : 'primary'}
                />
                <Button
                  label="関連クーポンを見る"
                  onPress={handleShowCoupons}
                  palette={palette}
                  variant="ghost"
                />
              </View>

              {showCoupons ? (
                <View style={styles.couponSection}>
                  <Text style={[styles.sectionTitle, { color: palette.text }]}>
                    関連クーポン
                  </Text>
                  {relatedCoupons.length === 0 ? (
                    <Text style={[styles.empty, { color: palette.textSecondary }]}>
                      このスポットのクーポンはありません。
                    </Text>
                  ) : (
                    relatedCoupons.map((coupon) => (
                      <View
                        key={coupon.id}
                        style={[
                          styles.couponCard,
                          {
                            backgroundColor: palette.background,
                            borderColor: palette.border,
                          },
                        ]}
                      >
                        <Text style={[styles.couponTitle, { color: palette.text }]}>
                          {coupon.title}
                        </Text>
                        <Text
                          style={[
                            styles.couponDetail,
                            { color: palette.textSecondary },
                          ]}
                        >
                          {coupon.discount_detail}
                        </Text>
                        <Text style={[styles.couponExpiry, { color: palette.muted }]}>
                          {formatValidUntil(coupon.valid_until)}
                        </Text>
                        <Button
                          label="クーポンを使用する"
                          onPress={() => handleUseCoupon(coupon)}
                          palette={palette}
                        />
                      </View>
                    ))
                  )}
                </View>
              ) : null}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(43, 29, 31, 0.45)',
  },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  close: {
    position: 'absolute',
    top: 14,
    right: 16,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 20,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  address: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
  couponSection: {
    gap: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  empty: {
    fontSize: 14,
    lineHeight: 22,
  },
  couponCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  couponDetail: {
    fontSize: 14,
    lineHeight: 21,
  },
  couponExpiry: {
    fontSize: 12,
    fontWeight: '600',
  },
});
