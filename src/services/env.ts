export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

export type SupabaseEnvCheck = {
  urlLoaded: boolean;
  anonKeyLoaded: boolean;
  urlPreview: string;
  anonKeyLength: number;
  isPlaceholder: boolean;
  configured: boolean;
  message: string;
};

function readUrl(): string {
  // Expo は process.env.EXPO_PUBLIC_* のドット参照だけをバンドルに埋め込む
  return (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();
}

function readAnonKey(): string {
  return (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
}

function isPlaceholderValue(url: string, anonKey: string): boolean {
  return (
    url.includes('YOUR_PROJECT_ID') ||
    anonKey.includes('YOUR_SUPABASE_ANON_KEY') ||
    anonKey === 'YOUR_SUPABASE_ANON_KEY'
  );
}

function toUrlPreview(url: string): string {
  if (url.length === 0) {
    return '(empty)';
  }

  try {
    return new URL(url).host;
  } catch {
    return `${url.slice(0, 32)}… (invalid URL)`;
  }
}

export function inspectSupabaseEnv(): SupabaseEnvCheck {
  const url = readUrl();
  const anonKey = readAnonKey();
  const urlLoaded = url.length > 0;
  const anonKeyLoaded = anonKey.length > 0;
  const isPlaceholder = isPlaceholderValue(url, anonKey);
  const configured = urlLoaded && anonKeyLoaded && !isPlaceholder;

  let message: string;
  if (!urlLoaded && !anonKeyLoaded) {
    message =
      '.env の EXPO_PUBLIC_SUPABASE_URL と EXPO_PUBLIC_SUPABASE_ANON_KEY が読めていません。';
  } else if (!urlLoaded) {
    message = 'EXPO_PUBLIC_SUPABASE_URL が空です。';
  } else if (!anonKeyLoaded) {
    message = 'EXPO_PUBLIC_SUPABASE_ANON_KEY が空です。';
  } else if (isPlaceholder) {
    message =
      '.env が .env.example のプレースホルダのままです。実際の URL と anon key を入れてください。';
  } else {
    message = '環境変数は読み込めました。';
  }

  const check: SupabaseEnvCheck = {
    urlLoaded,
    anonKeyLoaded,
    urlPreview: toUrlPreview(url),
    anonKeyLength: anonKey.length,
    isPlaceholder,
    configured,
    message,
  };

  console.log('[DateSpot] env check', {
    urlLoaded: check.urlLoaded,
    anonKeyLoaded: check.anonKeyLoaded,
    urlPreview: check.urlPreview,
    anonKeyLength: check.anonKeyLength,
    isPlaceholder: check.isPlaceholder,
    configured: check.configured,
    usesAtEnv: false,
    source: 'process.env.EXPO_PUBLIC_*',
    message: check.message,
  });

  return check;
}

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const check = inspectSupabaseEnv();
  if (!check.configured) {
    return null;
  }

  return {
    url: readUrl(),
    anonKey: readAnonKey(),
  };
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicConfig() !== null;
}
