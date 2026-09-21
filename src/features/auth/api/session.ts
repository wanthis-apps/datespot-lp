import type { Session, User } from '@supabase/supabase-js';
import type { RelationshipStatus } from '@/types';
import { getSupabaseClient } from '@/services/supabase';

export type EnsureSessionResult = {
  ok: boolean;
  session: Session | null;
  user: User | null;
  message: string;
};

let ensureSessionInFlight: Promise<EnsureSessionResult> | null = null;

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export async function getCurrentUserId(): Promise<string | null> {
  const client = getSupabaseClient();
  if (client === null) {
    return null;
  }

  const { data, error } = await client.auth.getSession();
  if (error !== null) {
    console.warn('[DateSpot] セッション取得に失敗', error.message);
    return null;
  }

  return data.session?.user.id ?? null;
}

async function createAnonymousSession(): Promise<EnsureSessionResult> {
  const client = getSupabaseClient();
  if (client === null) {
    return {
      ok: false,
      session: null,
      user: null,
      message: 'Supabase が未設定のためセッションを確保できません。',
    };
  }

  try {
    const { data: existing, error: sessionError } = await client.auth.getSession();
    if (sessionError !== null) {
      console.warn('[DateSpot] getSession エラー', sessionError.message);
    }

    if (existing.session !== null) {
      return {
        ok: true,
        session: existing.session,
        user: existing.session.user,
        message: '既存のセッションを利用します。',
      };
    }

    const { data, error } = await client.auth.signInAnonymously();
    if (error !== null || data.session === null || data.user === null) {
      return {
        ok: false,
        session: null,
        user: null,
        message: `匿名ログインに失敗しました: ${error?.message ?? 'session が null です'}`,
      };
    }

    console.log('[DateSpot] 匿名セッションを作成しました', data.user.id);
    return {
      ok: true,
      session: data.session,
      user: data.user,
      message: '匿名セッションを作成しました。',
    };
  } catch (error) {
    return {
      ok: false,
      session: null,
      user: null,
      message: `セッション確保中に例外: ${toErrorMessage(error)}`,
    };
  }
}

export async function ensureAnonymousSession(): Promise<EnsureSessionResult> {
  if (ensureSessionInFlight !== null) {
    return ensureSessionInFlight;
  }

  ensureSessionInFlight = createAnonymousSession().finally(() => {
    ensureSessionInFlight = null;
  });

  return ensureSessionInFlight;
}

export async function ensureAppUser(
  relationshipStatus: RelationshipStatus,
): Promise<string | null> {
  const client = getSupabaseClient();
  if (client === null) {
    return null;
  }

  const ensured = await ensureAnonymousSession();
  if (!ensured.ok || ensured.user === null) {
    return null;
  }

  const { error: upsertError } = await client.from('users').upsert(
    {
      id: ensured.user.id,
      relationship_status: relationshipStatus,
    },
    { onConflict: 'id', ignoreDuplicates: true },
  );

  if (upsertError !== null) {
    console.error('[DateSpot] public.users の確保に失敗', upsertError.message);
  }

  return ensured.user.id;
}
