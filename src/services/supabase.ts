import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { getSupabasePublicConfig, inspectSupabaseEnv } from './env';

export type DateSpotSupabaseClient = SupabaseClient<Database>;

export type SupabaseProbeResult = {
  ok: boolean;
  stage: 'config' | 'client' | 'query' | 'exception';
  message: string;
  count: number;
  names: string[];
  stack: string | null;
};

let supabaseClient: DateSpotSupabaseClient | null = null;
let clientInitError: string | null = null;

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function toErrorStack(error: unknown): string | null {
  if (error instanceof Error && error.stack !== undefined) {
    return error.stack;
  }
  return null;
}

export function getSupabaseClient(): DateSpotSupabaseClient | null {
  if (supabaseClient !== null) {
    return supabaseClient;
  }

  try {
    const config = getSupabasePublicConfig();
    if (config === null) {
      clientInitError = inspectSupabaseEnv().message;
      console.warn('[DateSpot] skip Supabase init', clientInitError);
      return null;
    }

    supabaseClient = createClient<Database>(config.url, config.anonKey, {
      auth: {
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
    clientInitError = null;
    console.log('[DateSpot] Supabase client 初期化OK');
    return supabaseClient;
  } catch (error) {
    supabaseClient = null;
    clientInitError = toErrorMessage(error);
    console.error('[DateSpot] Supabase client 初期化失敗', error);
    return null;
  }
}

export async function probeSupabaseConnection(): Promise<SupabaseProbeResult> {
  const env = inspectSupabaseEnv();

  try {
    if (!env.configured) {
      return {
        ok: false,
        stage: 'config',
        message: env.message,
        count: 0,
        names: [],
        stack: null,
      };
    }

    const client = getSupabaseClient();
    if (client === null) {
      return {
        ok: false,
        stage: 'client',
        message: clientInitError ?? 'Supabase クライアントを作成できませんでした。',
        count: 0,
        names: [],
        stack: null,
      };
    }

    const { data, error } = await client
      .from('spots')
      .select('id, name')
      .limit(10);

    if (error !== null) {
      const result: SupabaseProbeResult = {
        ok: false,
        stage: 'query',
        message: `spots 取得エラー: ${error.message}`,
        count: 0,
        names: [],
        stack: null,
      };
      console.error('[DateSpot] spots probe error', error.message);
      return result;
    }

    const rows = data ?? [];
    const result: SupabaseProbeResult = {
      ok: true,
      stage: 'query',
      message:
        rows.length === 0
          ? '接続は成功しましたが spots は 0 件です。seed.sql を確認してください。'
          : `Supabase から ${rows.length} 件取得しました。`,
      count: rows.length,
      names: rows.map((row) => row.name),
      stack: null,
    };
    console.log('[DateSpot] spots probe', {
      count: result.count,
      names: result.names,
    });
    return result;
  } catch (error) {
    const result: SupabaseProbeResult = {
      ok: false,
      stage: 'exception',
      message: `例外: ${toErrorMessage(error)}`,
      count: 0,
      names: [],
      stack: toErrorStack(error),
    };
    console.error('[DateSpot] spots probe exception', error);
    return result;
  }
}
