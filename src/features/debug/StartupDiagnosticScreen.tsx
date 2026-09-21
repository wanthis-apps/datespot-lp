import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  inspectSupabaseEnv,
  probeSupabaseConnection,
  type SupabaseEnvCheck,
  type SupabaseProbeResult,
} from '../../services';

function toErrorText(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }
  return String(error);
}

export function StartupDiagnosticScreen() {
  const [envCheck, setEnvCheck] = useState<SupabaseEnvCheck | null>(null);
  const [probe, setProbe] = useState<SupabaseProbeResult | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const runProbe = useCallback(async () => {
    setLoading(true);
    setFatal(null);

    try {
      setEnvCheck(inspectSupabaseEnv());
      const result = await probeSupabaseConnection();
      setProbe(result);
    } catch (error) {
      const text = toErrorText(error);
      console.error('[DateSpot] diagnostic fallback', error);
      setFatal(text);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void runProbe();
  }, [runProbe]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>DateSpot debug</Text>
        <Text style={styles.title}>起動診断</Text>
        <Text style={styles.lead}>
          「Something went wrong.」の代わりに、ここで原因を確認できます。Metro
          ターミナルにも同じ内容を [DateSpot] で出力します。
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. 環境変数 (.env)</Text>
          <Text style={styles.body}>
            このプロジェクトは @env（react-native-dotenv）を使いません。Expo SDK 57
            の process.env.EXPO_PUBLIC_* を読みます。
          </Text>
          {envCheck === null ? (
            <Text style={styles.body}>確認中...</Text>
          ) : (
            <>
              <Text style={styles.mono}>
                URL loaded: {String(envCheck.urlLoaded)}
              </Text>
              <Text style={styles.mono}>
                URL host: {envCheck.urlPreview}
              </Text>
              <Text style={styles.mono}>
                Anon key loaded: {String(envCheck.anonKeyLoaded)}
              </Text>
              <Text style={styles.mono}>
                Anon key length: {envCheck.anonKeyLength}
              </Text>
              <Text style={styles.mono}>
                placeholder: {String(envCheck.isPlaceholder)}
              </Text>
              <Text
                style={envCheck.configured ? styles.ok : styles.ng}
                selectable
              >
                {envCheck.message}
              </Text>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>2. Supabase 取得</Text>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#e86b4a" />
              <Text style={styles.body}>spots を取得しています...</Text>
            </View>
          ) : probe === null ? (
            <Text style={styles.ng}>probe 結果がありません。</Text>
          ) : (
            <>
              <Text style={probe.ok ? styles.ok : styles.ng} selectable>
                {probe.message}
              </Text>
              <Text style={styles.mono}>stage: {probe.stage}</Text>
              <Text style={styles.mono}>count: {probe.count}</Text>
              {probe.names.length > 0 ? (
                <Text style={styles.body} selectable>
                  {probe.names.join('\n')}
                </Text>
              ) : null}
              {probe.stack !== null ? (
                <Text style={styles.stack} selectable>
                  {probe.stack}
                </Text>
              ) : null}
            </>
          )}
        </View>

        {fatal !== null ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Catch した例外</Text>
            <Text style={styles.stack} selectable>
              {fatal}
            </Text>
          </View>
        ) : null}

        <Pressable onPress={() => void runProbe()} style={styles.button}>
          <Text style={styles.buttonLabel}>再診断する</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1412',
  },
  content: {
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 48,
    gap: 16,
  },
  kicker: {
    color: '#f3c6b4',
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    color: '#fff8f5',
    fontSize: 26,
    fontWeight: '700',
  },
  lead: {
    color: '#ead9d3',
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#2a1d1a',
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    color: '#fff8f5',
    fontSize: 17,
    fontWeight: '700',
  },
  body: {
    color: '#ead9d3',
    fontSize: 14,
    lineHeight: 20,
  },
  mono: {
    color: '#d7c4bd',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  ok: {
    color: '#9be7b5',
    fontSize: 15,
    lineHeight: 22,
  },
  ng: {
    color: '#ffb4a4',
    fontSize: 15,
    lineHeight: 22,
  },
  stack: {
    color: '#d7c4bd',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#e86b4a',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonLabel: {
    color: '#fff8f5',
    fontWeight: '700',
  },
});
