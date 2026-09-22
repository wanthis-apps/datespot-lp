import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { showToast } from '@/context/toastStore';
import { useAuth } from '@/features/auth';
import { getSupabaseClient } from '@/services/supabase';
import type { Review } from '../types/database';
import { mapReviewRow, toErrorMessage } from './mapRecords';

const HELPFUL_STORAGE_KEY = '@datespot/review-helpful';
const REMOTE_REVIEW_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type UseReviewsResult = {
  reviews: Review[];
  averageRating: number | null;
  reviewCount: number;
  helpfulReviewIds: string[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  submitReview: (
    rating: number,
    comment: string,
  ) => Promise<{ ok: boolean; message: string }>;
  toggleHelpful: (reviewId: string) => void;
  refetch: () => Promise<void>;
};

type HelpfulStorage = {
  votedIds: string[];
  counts: Record<string, number>;
};

type HelpfulState = HelpfulStorage & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  toggleVote: (
    reviewId: string,
    currentCount: number,
  ) => { nextCount: number; voted: boolean };
  reset: () => Promise<void>;
};

const MOCK_REVIEWS: Review[] = [
  {
    id: 'review-mock-1',
    spot_id: 'spot-daikanyama-bloom',
    user_id: 'mock-user-1',
    user_name: 'あかり',
    rating: 5,
    comment: 'テラスが静かで、初デートにぴったりでした。',
    helpful_count: 12,
    created_at: '2026-08-12T04:20:00.000Z',
  },
  {
    id: 'review-mock-2',
    spot_id: 'spot-daikanyama-bloom',
    user_id: 'mock-user-2',
    user_name: 'そうた',
    rating: 4,
    comment: 'コーヒーが美味しく、会話が弾みました。',
    helpful_count: 5,
    created_at: '2026-07-03T11:10:00.000Z',
  },
  {
    id: 'review-mock-3',
    spot_id: '10000000-0000-4000-8000-000000000001',
    user_id: 'mock-user-1',
    user_name: 'あかり',
    rating: 5,
    comment: '木漏れ日のテラスがとても良い雰囲気です。',
    helpful_count: 8,
    created_at: '2026-08-12T04:20:00.000Z',
  },
  {
    id: 'review-mock-4',
    spot_id: 'spot-tokyo-tower',
    user_id: 'mock-user-3',
    user_name: 'みお',
    rating: 5,
    comment: '夜景がきれいで、記念日にまた来たいです。',
    helpful_count: 21,
    created_at: '2026-09-01T12:40:00.000Z',
  },
  {
    id: 'review-mock-5',
    spot_id: '10000000-0000-4000-8000-000000000005',
    user_id: 'mock-user-3',
    user_name: 'みお',
    rating: 4,
    comment: '風が心地よく、夜景をゆっくり見られました。',
    helpful_count: 3,
    created_at: '2026-09-01T12:40:00.000Z',
  },
  {
    id: 'review-mock-6',
    spot_id: 'spot-ebisu-olive',
    user_id: 'mock-user-2',
    user_name: 'そうた',
    rating: 4,
    comment: '会話が途切れず、コースのペースもちょうど良いです。',
    helpful_count: 7,
    created_at: '2026-06-18T08:30:00.000Z',
  },
];

function parseHelpfulStorage(value: unknown): HelpfulStorage {
  if (typeof value !== 'object' || value === null) {
    return { votedIds: [], counts: {} };
  }

  const record = value as Record<string, unknown>;
  const votedIds = Array.isArray(record.votedIds)
    ? record.votedIds.filter(
        (item): item is string => typeof item === 'string' && item !== '',
      )
    : [];

  const counts: Record<string, number> = {};
  if (typeof record.counts === 'object' && record.counts !== null) {
    Object.entries(record.counts as Record<string, unknown>).forEach(
      ([id, count]) => {
        if (typeof count === 'number' && Number.isFinite(count)) {
          counts[id] = Math.max(0, Math.round(count));
        }
      },
    );
  }

  return { votedIds, counts };
}

function applyHelpfulCounts(
  reviews: Review[],
  counts: Record<string, number>,
): Review[] {
  return reviews.map((review) => {
    const overlay = counts[review.id];
    return overlay === undefined
      ? review
      : { ...review, helpful_count: overlay };
  });
}

export const useReviewHelpfulStore = create<HelpfulState>((set, get) => ({
  votedIds: [],
  counts: {},
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) {
      return;
    }

    try {
      const raw = await AsyncStorage.getItem(HELPFUL_STORAGE_KEY);
      const parsed: unknown = raw === null ? {} : JSON.parse(raw);
      set({ ...parseHelpfulStorage(parsed), hydrated: true });
    } catch (error) {
      console.warn('[DateSpot] 参考になったの読み込みに失敗', error);
      set({ votedIds: [], counts: {}, hydrated: true });
    }
  },
  toggleVote: (reviewId, currentCount) => {
    const trimmed = reviewId.trim();
    const { votedIds, counts } = get();
    const alreadyVoted = votedIds.includes(trimmed);
    const nextCount = Math.max(0, currentCount + (alreadyVoted ? -1 : 1));
    const nextIds = alreadyVoted
      ? votedIds.filter((id) => id !== trimmed)
      : [...votedIds, trimmed];
    const nextCounts = { ...counts, [trimmed]: nextCount };

    set({ votedIds: nextIds, counts: nextCounts, hydrated: true });
    void AsyncStorage.setItem(
      HELPFUL_STORAGE_KEY,
      JSON.stringify({ votedIds: nextIds, counts: nextCounts }),
    );

    return { nextCount, voted: !alreadyVoted };
  },
  reset: async () => {
    set({ votedIds: [], counts: {}, hydrated: true });
    try {
      await AsyncStorage.removeItem(HELPFUL_STORAGE_KEY);
    } catch (error) {
      console.warn('[DateSpot] 参考になったの初期化に失敗', error);
    }
  },
}));

function getMockReviews(spotId: string): Review[] {
  return MOCK_REVIEWS.filter((review) => review.spot_id === spotId);
}

function resolveUserName(
  user: ReturnType<typeof useAuth>['user'],
): string {
  if (user === null) {
    return 'ゲスト';
  }

  const metadata: unknown = user.user_metadata;
  if (typeof metadata === 'object' && metadata !== null) {
    const record = metadata as Record<string, unknown>;
    const fullName = record.full_name;
    if (typeof fullName === 'string' && fullName.trim() !== '') {
      return fullName.trim();
    }
  }

  const email = user.email;
  if (email !== undefined && email.includes('@')) {
    const localPart = email.split('@')[0];
    if (localPart !== undefined && localPart !== '') {
      return localPart;
    }
  }

  return 'ゲスト';
}

async function syncHelpfulCount(
  reviewId: string,
  helpfulCount: number,
): Promise<void> {
  if (!REMOTE_REVIEW_ID.test(reviewId)) {
    return;
  }

  const client = getSupabaseClient();
  if (client === null) {
    return;
  }

  try {
    const { error } = await client
      .from('reviews')
      .update({ helpful_count: helpfulCount })
      .eq('id', reviewId);

    if (error !== null) {
      console.warn('[DateSpot] 参考になったの同期に失敗', error.message);
    }
  } catch (caught) {
    console.warn('[DateSpot] 参考になったの同期に失敗', caught);
  }
}

export function useReviews(spotId: string | null): UseReviewsResult {
  const { user, userId } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const votedIds = useReviewHelpfulStore((state) => state.votedIds);
  const counts = useReviewHelpfulStore((state) => state.counts);
  const hydrated = useReviewHelpfulStore((state) => state.hydrated);
  const hydrate = useReviewHelpfulStore((state) => state.hydrate);
  const toggleVote = useReviewHelpfulStore((state) => state.toggleVote);

  const refetch = useCallback(async (): Promise<void> => {
    if (spotId === null) {
      setReviews([]);
      return;
    }

    setLoading(true);
    setError(null);

    const overlay = useReviewHelpfulStore.getState().counts;
    const fallback = applyHelpfulCounts(getMockReviews(spotId), overlay);
    const client = getSupabaseClient();
    if (client === null) {
      setReviews(fallback);
      setLoading(false);
      return;
    }

    try {
      const { data, error: queryError } = await client
        .from('reviews')
        .select('*')
        .eq('spot_id', spotId)
        .order('created_at', { ascending: false });

      if (queryError !== null) {
        setReviews(fallback);
        return;
      }

      const rows = Array.isArray(data) ? data : [];
      const mapped = rows.flatMap((row) => {
        const review = mapReviewRow(row);
        return review === null ? [] : [review];
      });
      setReviews(
        applyHelpfulCounts(mapped.length > 0 ? mapped : fallback, overlay),
      );
    } catch (caught) {
      setReviews(fallback);
      setError(toErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [spotId]);

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    setReviews((current) => applyHelpfulCounts(current, counts));
  }, [counts, hydrated]);

  const submitReview = useCallback(
    async (
      rating: number,
      comment: string,
    ): Promise<{ ok: boolean; message: string }> => {
      if (spotId === null) {
        return { ok: false, message: 'スポットが選択されていません。' };
      }

      if (rating < 1 || rating > 5) {
        return { ok: false, message: '評価は1〜5で選んでください。' };
      }

      const trimmed = comment.trim();
      if (trimmed.length === 0) {
        return { ok: false, message: 'コメントを入力してください。' };
      }

      const draft: Review = {
        id: `local-${Date.now()}`,
        spot_id: spotId,
        user_id: userId ?? 'guest',
        user_name: resolveUserName(user),
        rating,
        comment: trimmed,
        helpful_count: 0,
        created_at: new Date().toISOString(),
      };

      setSubmitting(true);
      const client = getSupabaseClient();

      try {
        if (client !== null && userId !== null) {
          const { data, error: insertError } = await client
            .from('reviews')
            .insert({
              spot_id: spotId,
              user_id: userId,
              user_name: draft.user_name,
              rating,
              comment: trimmed,
              helpful_count: 0,
            })
            .select('*')
            .single();

          if (insertError === null) {
            const saved = mapReviewRow(data);
            setReviews((current) =>
              saved === null ? [draft, ...current] : [saved, ...current],
            );
            showToast({ message: 'レビューを投稿しました', type: 'success' });
            return { ok: true, message: 'レビューを投稿しました。' };
          }
        }

        setReviews((current) => [draft, ...current]);
        showToast({ message: 'レビューを投稿しました', type: 'success' });
        return {
          ok: true,
          message:
            client === null || userId === null
              ? 'レビューを端末に保存しました。'
              : '投稿を受け付けました。',
        };
      } catch (caught) {
        setReviews((current) => [draft, ...current]);
        showToast({ message: 'レビューを端末に保存しました', type: 'success' });
        return {
          ok: true,
          message: `投稿を端末に保存しました: ${toErrorMessage(caught)}`,
        };
      } finally {
        setSubmitting(false);
      }
    },
    [spotId, user, userId],
  );

  const toggleHelpful = useCallback(
    (reviewId: string): void => {
      const current = reviews.find((review) => review.id === reviewId);
      if (current === undefined) {
        return;
      }

      const { nextCount } = toggleVote(reviewId, current.helpful_count);
      setReviews((list) =>
        list.map((review) =>
          review.id === reviewId
            ? { ...review, helpful_count: nextCount }
            : review,
        ),
      );
      void syncHelpfulCount(reviewId, nextCount);
    },
    [reviews, toggleVote],
  );

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return null;
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }, [reviews]);

  return {
    reviews,
    averageRating,
    reviewCount: reviews.length,
    helpfulReviewIds: votedIds,
    loading,
    submitting,
    error,
    submitReview,
    toggleHelpful,
    refetch,
  };
}
