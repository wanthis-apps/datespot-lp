import { useCallback, useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { showToast } from '@/context/toastStore';
import { useAuth } from '@/features/auth';
import { useSpotCatalogStore } from '@/features/spots/store/spotCatalogStore';
import { getSupabaseClient } from '@/services/supabase';
import type { Plan, Spot } from '../types/database';
import {
  attachPlanSpots,
  mapCatalogSpot,
  mapPlanRow,
  mapPlanSpotRow,
  mapSpotRow,
  toErrorMessage,
} from './mapRecords';

export type CreatePlanInput = {
  title: string;
  description: string;
  is_public?: boolean;
  spots: Array<{
    spot: Spot;
    visit_time?: string | null;
  }>;
};

export type UsePlansResult = {
  plans: Plan[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  createPlan: (
    input: CreatePlanInput,
  ) => Promise<{ ok: boolean; message: string }>;
  deletePlan: (planId: string) => Promise<{ ok: boolean; message: string }>;
  refetch: () => Promise<void>;
};

const MOCK_PLANS: Plan[] = [
  {
    id: 'plan-mock-1',
    user_id: 'guest',
    title: '代官山のんびり午後',
    description: 'カフェからはじめて、夜景でしめる定番コース。',
    is_public: true,
    created_at: '2026-08-20T03:00:00.000Z',
    plan_spots: [
      {
        id: 'plan-mock-1-spot-1',
        plan_id: 'plan-mock-1',
        spot_id: 'spot-daikanyama-bloom',
        order_index: 0,
        visit_time: '14:00',
      },
      {
        id: 'plan-mock-1-spot-2',
        plan_id: 'plan-mock-1',
        spot_id: 'spot-ebisu-olive',
        order_index: 1,
        visit_time: '16:30',
      },
      {
        id: 'plan-mock-1-spot-3',
        plan_id: 'plan-mock-1',
        spot_id: 'spot-tokyo-tower',
        order_index: 2,
        visit_time: '19:00',
      },
    ],
  },
  {
    id: 'plan-mock-2',
    user_id: 'guest',
    title: '記念日の夜コース',
    description: '夜景とバーで、ゆっくり話せる一日。',
    is_public: false,
    created_at: '2026-09-02T10:15:00.000Z',
    plan_spots: [
      {
        id: 'plan-mock-2-spot-1',
        plan_id: 'plan-mock-2',
        spot_id: 'spot-omotesando-sun',
        order_index: 0,
        visit_time: '17:00',
      },
      {
        id: 'plan-mock-2-spot-2',
        plan_id: 'plan-mock-2',
        spot_id: 'spot-ebisu-lueur',
        order_index: 1,
        visit_time: '20:00',
      },
    ],
  },
];

function isLocalPlanId(planId: string): boolean {
  return planId.startsWith('local-') || planId.startsWith('plan-mock-');
}

function keepLocalPlans(current: Plan[]): Plan[] {
  return current.filter((plan) => plan.id.startsWith('local-'));
}

function cloneMockPlans(): Plan[] {
  return MOCK_PLANS.map((plan) => ({
    ...plan,
    plan_spots: plan.plan_spots.map((spot) => ({ ...spot })),
  }));
}

type PlansSeedMode = 'idle' | 'mock' | 'empty';

type PlansSeedState = {
  version: number;
  mode: PlansSeedMode;
  resetToMock: () => void;
  resetToEmpty: () => void;
};

export const usePlansSeedStore = create<PlansSeedState>((set) => ({
  version: 0,
  mode: 'idle',
  resetToMock: () =>
    set((state) => ({ version: state.version + 1, mode: 'mock' })),
  resetToEmpty: () =>
    set((state) => ({ version: state.version + 1, mode: 'empty' })),
}));

export function usePlans(): UsePlansResult {
  const { userId } = useAuth();
  const catalogSpots = useSpotCatalogStore((state) => state.spots);
  const seedVersion = usePlansSeedStore((state) => state.version);
  const seedMode = usePlansSeedStore((state) => state.mode);
  const [remoteSpots, setRemoteSpots] = useState<Spot[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const spotById = useMemo(() => {
    const map = new Map<string, Spot>();
    catalogSpots.forEach((spot) => {
      map.set(spot.id, mapCatalogSpot(spot));
    });
    remoteSpots.forEach((spot) => {
      const current = map.get(spot.id);
      map.set(spot.id, {
        ...spot,
        image_url: spot.image_url ?? current?.image_url ?? null,
        price_range: spot.price_range ?? current?.price_range ?? null,
      });
    });
    return map;
  }, [catalogSpots, remoteSpots]);

  const refetch = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    const client = getSupabaseClient();
    if (client === null) {
      setRemoteSpots([]);
      setPlans((current) => [
        ...keepLocalPlans(current),
        ...MOCK_PLANS,
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data: spotData } = await client.from('spots').select('*');
      const spotRows = Array.isArray(spotData) ? spotData : [];
      setRemoteSpots(
        spotRows.flatMap((row) => {
          const spot = mapSpotRow(row);
          return spot === null ? [] : [spot];
        }),
      );

      let query = client
        .from('plans')
        .select('*, plan_spots(*)')
        .order('created_at', { ascending: false });

      if (userId !== null) {
        query = query.or(`user_id.eq.${userId},is_public.eq.true`);
      } else {
        query = query.eq('is_public', true);
      }

      const { data, error: queryError } = await query;
      if (queryError !== null) {
        setPlans((current) => [...keepLocalPlans(current), ...MOCK_PLANS]);
        return;
      }

      const rows = Array.isArray(data) ? data : [];
      const mapped = rows.flatMap((row) => {
        const plan = mapPlanRow(row);
        return plan === null ? [] : [plan];
      });
      const ownOrPublic =
        userId === null
          ? mapped
          : mapped.filter(
              (plan) => plan.user_id === userId || plan.is_public,
            );

      setPlans((current) => {
        const localOnly = keepLocalPlans(current);
        return ownOrPublic.length > 0
          ? [...localOnly, ...ownOrPublic]
          : [...localOnly, ...MOCK_PLANS];
      });
    } catch (caught) {
      setPlans((current) => [...keepLocalPlans(current), ...MOCK_PLANS]);
      setError(toErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    if (seedMode === 'idle') {
      return;
    }

    setPlans(seedMode === 'mock' ? cloneMockPlans() : []);
  }, [seedMode, seedVersion]);

  const visiblePlans = useMemo(
    () => plans.map((plan) => attachPlanSpots(plan, spotById)),
    [plans, spotById],
  );

  const createPlan = useCallback(
    async (
      input: CreatePlanInput,
    ): Promise<{ ok: boolean; message: string }> => {
      const title = input.title.trim();
      if (title.length === 0) {
        return { ok: false, message: 'プラン名を入力してください。' };
      }

      if (input.spots.length === 0) {
        return { ok: false, message: 'スポットを1件以上追加してください。' };
      }

      const description =
        input.description.trim() === '' ? null : input.description.trim();
      const isPublic = input.is_public === true;
      const now = new Date().toISOString();
      const localId = `local-${Date.now()}`;
      const draft: Plan = {
        id: localId,
        user_id: userId ?? 'guest',
        title,
        description,
        is_public: isPublic,
        created_at: now,
        plan_spots: input.spots.map((item, index) => {
          const visitTime = item.visit_time?.trim() ?? '';
          return {
            id: `${localId}-spot-${index}`,
            plan_id: localId,
            spot_id: item.spot.id,
            order_index: index,
            visit_time: visitTime === '' ? null : visitTime,
            spot: item.spot,
          };
        }),
      };

      setSaving(true);
      const client = getSupabaseClient();

      try {
        if (client !== null && userId !== null) {
          const { data: planData, error: planError } = await client
            .from('plans')
            .insert({
              user_id: userId,
              title,
              description,
              is_public: isPublic,
            })
            .select('*')
            .single();

          if (planError === null) {
            const savedPlan = mapPlanRow(planData);
            const planId = savedPlan?.id ?? null;

            if (planId !== null) {
              const { data: spotRows, error: spotsError } = await client
                .from('plan_spots')
                .insert(
                  draft.plan_spots.map((item) => ({
                    plan_id: planId,
                    spot_id: item.spot_id,
                    order_index: item.order_index,
                    visit_time: item.visit_time,
                  })),
                )
                .select('*');

              const mappedSpots =
                spotsError === null && Array.isArray(spotRows)
                  ? spotRows.flatMap((row, index) => {
                      const fallback = draft.plan_spots[index];
                      const mapped = mapPlanSpotRow(row, fallback?.spot);
                      if (mapped === null) {
                        return fallback === undefined ? [] : [fallback];
                      }
                      return [mapped];
                    })
                  : draft.plan_spots.map((item) => ({
                      ...item,
                      plan_id: planId,
                    }));

              const nextPlan: Plan = {
                ...(savedPlan ?? draft),
                id: planId,
                plan_spots: mappedSpots,
              };

              setPlans((current) => [nextPlan, ...current]);
              showToast({ message: 'プランを保存しました', type: 'success' });
              return { ok: true, message: 'プランを保存しました。' };
            }
          }
        }

        setPlans((current) => [draft, ...current]);
        showToast({ message: 'プランを保存しました', type: 'success' });
        return {
          ok: true,
          message:
            client === null || userId === null
              ? 'プランを端末に保存しました。'
              : 'プランを保存しました。',
        };
      } catch (caught) {
        setPlans((current) => [draft, ...current]);
        showToast({ message: 'プランを端末に保存しました', type: 'success' });
        return {
          ok: true,
          message: `プランを端末に保存しました: ${toErrorMessage(caught)}`,
        };
      } finally {
        setSaving(false);
      }
    },
    [userId],
  );

  const deletePlan = useCallback(
    async (planId: string): Promise<{ ok: boolean; message: string }> => {
      setPlans((current) => current.filter((plan) => plan.id !== planId));

      const client = getSupabaseClient();
      if (client === null || userId === null || isLocalPlanId(planId)) {
        return { ok: true, message: 'プランを削除しました。' };
      }

      try {
        const { error: deleteError } = await client
          .from('plans')
          .delete()
          .eq('id', planId)
          .eq('user_id', userId);

        if (deleteError !== null) {
          return { ok: true, message: 'プランを端末上から削除しました。' };
        }

        return { ok: true, message: 'プランを削除しました。' };
      } catch (caught) {
        return {
          ok: true,
          message: `プランを端末上から削除しました: ${toErrorMessage(caught)}`,
        };
      }
    },
    [userId],
  );

  return {
    plans: visiblePlans,
    loading,
    saving,
    error,
    createPlan,
    deletePlan,
    refetch,
  };
}
