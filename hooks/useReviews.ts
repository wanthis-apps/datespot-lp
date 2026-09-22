import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth';
import { getSupabaseClient } from '@/services/supabase';
import type { Review } from '../types/database';
import { mapReviewRow, toErrorMessage } from './mapRecords';

export type UseReviewsResult = {
  reviews: Review[];
  averageRating: number | null;
  reviewCount: number;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  submitReview: (
    rating: number,
    comment: string,
  ) => Promise<{ ok: boolean; message: string }>;
  refetch: () => Promise<void>;
};

const MOCK_REVIEWS: Review[] = [
  {
    id: 'review-mock-1',
    spot_id: 'spot-daikanyama-bloom',
    user_id: 'mock-user-1',
    user_name: 'あかり',
    rating: 5,
    comment: 'テラスが静かで、初デートにぴったりでした。',
    created_at: '2026-08-12T04:20:00.000Z',
  },
  {
    id: 'review-mock-2',
    spot_id: 'spot-daikanyama-bloom',
    user_id: 'mock-user-2',
    user_name: 'そうた',
    rating: 4,
    comment: 'コーヒーが美味しく、会話が弾みました。',
    created_at: '2026-07-03T11:10:00.000Z',
  },
  {
    id: 'review-mock-3',
    spot_id: '10000000-0000-4000-8000-000000000001',
    user_id: 'mock-user-1',
    user_name: 'あかり',
    rating: 5,
    comment: '木漏れ日のテラスがとても良い雰囲気です。',
    created_at: '2026-08-12T04:20:00.000Z',
  },
  {
    id: 'review-mock-4',
    spot_id: 'spot-tokyo-tower',
    user_id: 'mock-user-3',
    user_name: 'みお',
    rating: 5,
    comment: '夜景がきれいで、記念日にまた来たいです。',
    created_at: '2026-09-01T12:40:00.000Z',
  },
  {
    id: 'review-mock-5',
    spot_id: '10000000-0000-4000-8000-000000000005',
    user_id: 'mock-user-3',
    user_name: 'みお',
    rating: 4,
    comment: '風が心地よく、夜景をゆっくり見られました。',
    created_at: '2026-09-01T12:40:00.000Z',
  },
  {
    id: 'review-mock-6',
    spot_id: 'spot-ebisu-olive',
    user_id: 'mock-user-2',
    user_name: 'そうた',
    rating: 4,
    comment: '会話が途切れず、コースのペースもちょうど良いです。',
    created_at: '2026-06-18T08:30:00.000Z',
  },
];

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

export function useReviews(spotId: string | null): UseReviewsResult {
  const { user, userId } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (): Promise<void> => {
    if (spotId === null) {
      setReviews([]);
      return;
    }

    setLoading(true);
    setError(null);

    const fallback = getMockReviews(spotId);
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
      setReviews(mapped.length > 0 ? mapped : fallback);
    } catch (caught) {
      setReviews(fallback);
      setError(toErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [spotId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

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
            })
            .select('*')
            .single();

          if (insertError === null) {
            const saved = mapReviewRow(data);
            setReviews((current) =>
              saved === null ? [draft, ...current] : [saved, ...current],
            );
            return { ok: true, message: 'レビューを投稿しました。' };
          }
        }

        setReviews((current) => [draft, ...current]);
        return {
          ok: true,
          message:
            client === null || userId === null
              ? 'レビューを端末に保存しました。'
              : '投稿を受け付けました。',
        };
      } catch (caught) {
        setReviews((current) => [draft, ...current]);
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
    loading,
    submitting,
    error,
    submitReview,
    refetch,
  };
}
