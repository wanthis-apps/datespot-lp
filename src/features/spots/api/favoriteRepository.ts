import { ensureAnonymousSession, getCurrentUserId } from '@/features/auth/api/session';
import { getSupabaseClient } from '@/services/supabase';

export type FavoriteRemoteResult =
  | { status: 'local' }
  | { status: 'synced' }
  | { status: 'failed'; message: string };

const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';
const INVALID_TEXT_REPRESENTATION = '22P02';
const NO_ROWS = 'PGRST116';

const BENIGN_CODES = new Set([
  UNIQUE_VIOLATION,
  FOREIGN_KEY_VIOLATION,
  INVALID_TEXT_REPRESENTATION,
  NO_ROWS,
]);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const insertInFlight = new Set<string>();

type PostgrestLikeError = {
  message?: string;
  details?: string;
  code?: string;
  hint?: string;
};

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function readPostgrestError(error: unknown): PostgrestLikeError {
  if (typeof error !== 'object' || error === null) {
    return { message: String(error) };
  }

  const record = error as PostgrestLikeError;
  return {
    message: record.message,
    details: record.details,
    code: record.code,
    hint: record.hint,
  };
}

function logFavoriteError(action: string, error: unknown): void {
  const detail = readPostgrestError(error);
  console.error(`[DateSpot] favorites ${action}`, {
    message: detail.message ?? null,
    details: detail.details ?? null,
    code: detail.code ?? null,
    hint: detail.hint ?? null,
  });
}

function isBenignFavoriteError(error: unknown): boolean {
  const code = readPostgrestError(error).code;
  return code !== undefined && BENIGN_CODES.has(code);
}

async function resolveUserId(): Promise<string | null> {
  const existing = await getCurrentUserId();
  if (existing !== null) {
    return existing;
  }

  const ensured = await ensureAnonymousSession();
  if (!ensured.ok || ensured.user === null) {
    return null;
  }

  return ensured.user.id;
}

export async function fetchFavoriteSpotIds(): Promise<string[] | null> {
  const client = getSupabaseClient();
  if (client === null) {
    return null;
  }

  const userId = await resolveUserId();
  if (userId === null) {
    return null;
  }

  const { data, error } = await client
    .from('favorites')
    .select('spot_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error !== null) {
    console.warn('[DateSpot] お気に入りの取得に失敗', error.message);
    return null;
  }

  return (data ?? []).map((row) => row.spot_id);
}

export async function insertFavorite(spotId: string): Promise<FavoriteRemoteResult> {
  const client = getSupabaseClient();
  if (client === null) {
    return { status: 'local' };
  }

  const userId = await resolveUserId();
  if (userId === null) {
    return { status: 'local' };
  }

  if (!isUuid(spotId)) {
    console.warn(
      '[DateSpot] favorites insert をスキップしました。spot_id が UUID ではありません',
      spotId,
    );
    return { status: 'local' };
  }

  const flightKey = `${userId}:${spotId}`;
  if (insertInFlight.has(flightKey)) {
    return { status: 'synced' };
  }

  insertInFlight.add(flightKey);
  try {
    // 通信失敗の確認用。普段はコメントのままにする。
    // 外すと追加は失敗し、ハートが元に戻りエラートーストが出る。
    // 実機では機内モードにしてから、ログイン済みでハートをタップする。
    // if (true) {
    //   throw new Error('意図的な通信エラーテスト');
    // }
    const { error } = await client.from('favorites').insert({
      user_id: userId,
      spot_id: spotId,
    });

    if (error === null || isBenignFavoriteError(error)) {
      if (error !== null) {
        logFavoriteError('insert', error);
      }
      return { status: 'synced' };
    }

    logFavoriteError('insert', error);
    return {
      status: 'failed',
      message: '通信に失敗したため、元に戻しました',
    };
  } catch (error) {
    logFavoriteError('insert', error);
    return {
      status: 'failed',
      message: '通信に失敗したため、元に戻しました',
    };
  } finally {
    insertInFlight.delete(flightKey);
  }
}

export async function deleteFavorite(spotId: string): Promise<FavoriteRemoteResult> {
  const client = getSupabaseClient();
  if (client === null) {
    return { status: 'local' };
  }

  const userId = await resolveUserId();
  if (userId === null) {
    return { status: 'local' };
  }

  if (!isUuid(spotId)) {
    console.warn(
      '[DateSpot] favorites delete をスキップしました。spot_id が UUID ではありません',
      spotId,
    );
    return { status: 'local' };
  }

  try {
    // 通信失敗の確認用。普段はコメントのままにする。
    // 外すと削除は失敗し、一覧が元に戻りエラートーストが出る。
    // 実機では機内モードにしてから、ログイン済みでハートを外す。
    // if (true) {
    //   throw new Error('意図的な通信エラーテスト');
    // }
    const { error } = await client
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('spot_id', spotId);

    if (error === null || isBenignFavoriteError(error)) {
      if (error !== null) {
        logFavoriteError('delete', error);
      }
      return { status: 'synced' };
    }

    logFavoriteError('delete', error);
    return {
      status: 'failed',
      message: '通信に失敗したため、元に戻しました',
    };
  } catch (error) {
    logFavoriteError('delete', error);
    return {
      status: 'failed',
      message: '通信に失敗したため、元に戻しました',
    };
  }
}

export async function deleteFavorites(
  spotIds: string[],
): Promise<FavoriteRemoteResult> {
  if (spotIds.length === 0) {
    return { status: 'synced' };
  }

  const client = getSupabaseClient();
  if (client === null) {
    return { status: 'local' };
  }

  const userId = await resolveUserId();
  if (userId === null) {
    return { status: 'local' };
  }

  const remoteIds = spotIds.filter((spotId) => isUuid(spotId));
  if (remoteIds.length === 0) {
    console.warn(
      '[DateSpot] favorites delete をスキップしました。UUID の spot_id がありません',
    );
    return { status: 'local' };
  }

  try {
    const { error } = await client
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .in('spot_id', remoteIds);

    if (error === null || isBenignFavoriteError(error)) {
      if (error !== null) {
        logFavoriteError('delete-many', error);
      }
      return { status: 'synced' };
    }

    logFavoriteError('delete-many', error);
    return {
      status: 'failed',
      message: '通信に失敗したため、元に戻しました',
    };
  } catch (error) {
    logFavoriteError('delete-many', error);
    return {
      status: 'failed',
      message: '通信に失敗したため、元に戻しました',
    };
  }
}
