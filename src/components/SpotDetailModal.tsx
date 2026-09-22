import { useMemo, useState, type ReactElement } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCouponList } from '../../hooks/useCouponList';
import {
  FOUNDATION_CATEGORY_LABELS,
  formatPriceRange,
  formatReviewDate,
  formatValidUntil,
} from '../../hooks/mapRecords';
import { formatSpotTagLabel } from '../../hooks/spotTags';
import { useReviews } from '../../hooks/useReviews';
import { useFavorites } from '@/features/spots/hooks/useFavorites';
import { shareSpot } from '@/utils/share';
import type { Palette } from '@/theme';
import type { Coupon, Review, Spot } from '../../types/database';
import { Button } from './Button';
import { RemoteImage } from './RemoteImage';
import { ReservationModal } from './ReservationModal';

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
  const {
    reviews,
    averageRating,
    reviewCount,
    loading: reviewsLoading,
    submitting,
    error: reviewsError,
    submitReview,
    helpfulReviewIds,
    toggleHelpful,
  } = useReviews(spot?.id ?? null);
  const [showCoupons, setShowCoupons] = useState(false);
  const [reservationVisible, setReservationVisible] = useState(false);
  const [draftRating, setDraftRating] = useState(0);
  const [draftComment, setDraftComment] = useState('');
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState<boolean | null>(null);

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

  const handleShareSpot = (): void => {
    if (spot === null) {
      return;
    }

    void shareSpot(spot).then((result) => {
      if (!result.ok) {
        Alert.alert('共有できませんでした', result.message);
      }
    });
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

  const resetReviewForm = (): void => {
    setDraftRating(0);
    setDraftComment('');
    setSubmitMessage(null);
    setSubmitOk(null);
  };

  const handleClose = (): void => {
    setShowCoupons(false);
    setReservationVisible(false);
    resetReviewForm();
    onClose();
  };

  const handleSubmitReview = (): void => {
    void (async () => {
      const result = await submitReview(draftRating, draftComment);
      setSubmitMessage(result.message);
      setSubmitOk(result.ok);
      if (result.ok) {
        setDraftRating(0);
        setDraftComment('');
      }
    })();
  };

  return (
    <>
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      onDismiss={() => setShowCoupons(false)}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
              keyboardShouldPersistTaps="handled"
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
                {(spot.tags ?? []).map((tag) => (
                  <View
                    key={tag}
                    style={[styles.tag, { backgroundColor: palette.background }]}
                  >
                    <Text style={[styles.tagText, { color: palette.textSecondary }]}>
                      {formatSpotTagLabel(tag)}
                    </Text>
                  </View>
                ))}
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
                  label="予約・空席確認"
                  onPress={() => setReservationVisible(true)}
                  palette={palette}
                />
                <Button
                  label={favorited ? 'お気に入り解除' : 'お気に入り追加'}
                  onPress={handleToggleFavorite}
                  palette={palette}
                  variant={favorited ? 'ghost' : 'primary'}
                />
                <Button
                  label="このスポットをシェア"
                  onPress={handleShareSpot}
                  palette={palette}
                  variant="ghost"
                />
                <Button
                  label="関連クーポンを見る"
                  onPress={handleShowCoupons}
                  palette={palette}
                  variant="ghost"
                />
              </View>

              <View style={styles.reviewSection}>
                <View style={styles.reviewHeader}>
                  <Text style={[styles.sectionTitle, { color: palette.text }]}>
                    レビュー・口コミ
                  </Text>
                  <View
                    style={[
                      styles.averageBadge,
                      { backgroundColor: palette.coupon },
                    ]}
                  >
                    <Ionicons
                      name="star"
                      size={14}
                      color={palette.couponText}
                    />
                    <Text
                      style={[styles.averageText, { color: palette.couponText }]}
                    >
                      {averageRating === null
                        ? '— まだ評価なし'
                        : `★ ${averageRating.toFixed(1)}  （${reviewCount}件）`}
                    </Text>
                  </View>
                </View>

                {reviewsError !== null ? (
                  <Text style={[styles.empty, { color: palette.textSecondary }]}>
                    {reviewsError}
                  </Text>
                ) : null}

                {reviewsLoading && reviews.length === 0 ? (
                  <Text style={[styles.empty, { color: palette.textSecondary }]}>
                    口コミを読み込んでいます…
                  </Text>
                ) : reviews.length === 0 ? (
                  <Text style={[styles.empty, { color: palette.textSecondary }]}>
                    まだ口コミはありません。最初のレビューを書いてみましょう。
                  </Text>
                ) : (
                  reviews.map((review) => (
                    <ReviewListItem
                      key={review.id}
                      review={review}
                      palette={palette}
                      helpful={helpfulReviewIds.includes(review.id)}
                      onToggleHelpful={toggleHelpful}
                    />
                  ))
                )}

                <View
                  style={[
                    styles.reviewForm,
                    {
                      backgroundColor: palette.background,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Text style={[styles.formLabel, { color: palette.text }]}>
                    レビューを書く
                  </Text>
                  <Text
                    style={[styles.formHint, { color: palette.textSecondary }]}
                  >
                    星を選んで、感想を入力してください。
                  </Text>
                  <StarPicker
                    value={draftRating}
                    palette={palette}
                    onChange={setDraftRating}
                  />
                  <TextInput
                    value={draftComment}
                    onChangeText={setDraftComment}
                    placeholder="雰囲気やおすすめポイントなど"
                    placeholderTextColor={palette.muted}
                    multiline
                    textAlignVertical="top"
                    style={[
                      styles.commentInput,
                      {
                        color: palette.text,
                        backgroundColor: palette.surface,
                        borderColor: palette.border,
                      },
                    ]}
                  />
                  <Button
                    label={submitting ? '投稿中…' : '投稿する'}
                    onPress={handleSubmitReview}
                    palette={palette}
                    disabled={submitting}
                  />
                  {submitMessage !== null ? (
                    <View
                      style={[
                        styles.submitMessage,
                        { backgroundColor: palette.primaryMuted },
                      ]}
                    >
                      <Text
                        style={[
                          styles.submitMessageText,
                          {
                            color:
                              submitOk === false
                                ? palette.primary
                                : palette.text,
                          },
                        ]}
                      >
                        {submitMessage}
                      </Text>
                    </View>
                  ) : null}
                </View>
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
      </KeyboardAvoidingView>
    </Modal>
    <ReservationModal
      visible={reservationVisible}
      spot={spot}
      palette={palette}
      onClose={() => setReservationVisible(false)}
    />
    </>
  );
}

function StarPicker({
  value,
  palette,
  onChange,
}: {
  value: number;
  palette: Palette;
  onChange?: (rating: number) => void;
}): ReactElement {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => {
        const selected = star <= value;
        const icon = (
          <Ionicons
            name={selected ? 'star' : 'star-outline'}
            size={22}
            color={selected ? palette.couponText : palette.muted}
          />
        );

        if (onChange === undefined) {
          return <View key={star}>{icon}</View>;
        }

        return (
          <Pressable
            key={star}
            accessibilityRole="button"
            accessibilityLabel={`評価 ${star}`}
            onPress={() => onChange(star)}
            style={styles.starButton}
          >
            {icon}
          </Pressable>
        );
      })}
    </View>
  );
}

function ReviewListItem({
  review,
  palette,
  helpful,
  onToggleHelpful,
}: {
  review: Review;
  palette: Palette;
  helpful: boolean;
  onToggleHelpful: (reviewId: string) => void;
}): ReactElement {
  return (
    <View
      style={[
        styles.reviewCard,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
        },
      ]}
    >
      <View style={styles.reviewMeta}>
        <Text style={[styles.reviewName, { color: palette.text }]}>
          {review.user_name}
        </Text>
        <Text style={[styles.reviewDate, { color: palette.muted }]}>
          {formatReviewDate(review.created_at)}
        </Text>
      </View>
      <StarPicker value={review.rating} palette={palette} />
      <Text style={[styles.reviewComment, { color: palette.textSecondary }]}>
        {review.comment}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: helpful }}
        accessibilityLabel={`参考になった ${review.helpful_count}件`}
        onPress={() => onToggleHelpful(review.id)}
        style={[
          styles.helpfulButton,
          {
            backgroundColor: helpful ? palette.primaryMuted : palette.surface,
            borderColor: helpful ? palette.primary : palette.border,
          },
        ]}
      >
        <Text
          style={[
            styles.helpfulLabel,
            { color: helpful ? palette.primary : palette.textSecondary },
          ]}
        >
          {`👍 参考になった (${review.helpful_count})`}
        </Text>
      </Pressable>
    </View>
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
  reviewSection: {
    gap: 12,
    marginTop: 8,
  },
  reviewHeader: {
    gap: 8,
  },
  averageBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  averageText: {
    fontSize: 13,
    fontWeight: '700',
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  reviewName: {
    fontSize: 15,
    fontWeight: '700',
  },
  reviewDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 22,
  },
  helpfulButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  helpfulLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  reviewForm: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  formHint: {
    fontSize: 13,
    lineHeight: 20,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starButton: {
    padding: 2,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 88,
    fontSize: 15,
    lineHeight: 22,
  },
  submitMessage: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  submitMessageText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
});
