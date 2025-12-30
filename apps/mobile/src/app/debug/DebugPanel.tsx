import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type KV = { key: string; raw: string | null; pretty: string; isJson: boolean };

export type DebugPanelProps = {
  /** 初期展開状態 */
  initialOpen?: boolean;
  /** パネルのタイトル */
  title?: string;
  /** 自動読み込み: 展開した瞬間に dump する（デフォルト true） */
  autoLoadOnOpen?: boolean;
  /** 値が長い場合に先頭から何文字表示するか（デフォルト 4000） */
  maxValueChars?: number;
  /** デバッグビルド以外では表示しない等のために */
  hidden?: boolean;

  /**
   * 「自分のアプリのキーだけ」削除するための prefix。
   * 例: "app:" / "myapp:" / "strata:" など。
   * デフォルトは "app:"。
   */
  appKeyPrefix: string;

  /** multiRemove / multiGet を安全に回すためのチャンクサイズ（デフォルト 200） */
  chunkSize?: number;
};

function chunkArray<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [arr];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function DebugPanel({
  initialOpen = false,
  title = "Debug Panel",
  autoLoadOnOpen = true,
  maxValueChars = 4000,
  hidden = false,

  appKeyPrefix = "app:",

  chunkSize = 200,
}: DebugPanelProps) {
  const [open, setOpen] = useState(initialOpen);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<KV[]>([]);
  const [query, setQuery] = useState("");

  const parseValue = useCallback(
    (raw: string | null): { pretty: string; isJson: boolean } => {
      if (raw == null) return { pretty: "null", isJson: false };

      const clipped =
        raw.length > maxValueChars
          ? raw.slice(0, maxValueChars) + `\n…(truncated, ${raw.length} chars)`
          : raw;

      const trimmed = clipped.trim();
      const looksJson =
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
        (trimmed.startsWith('"') && trimmed.endsWith('"'));

      if (!looksJson) return { pretty: clipped, isJson: false };

      try {
        const parsed = JSON.parse(trimmed);
        return { pretty: JSON.stringify(parsed, null, 2), isJson: true };
      } catch {
        return { pretty: clipped, isJson: false };
      }
    },
    [maxValueChars]
  );

  const dump = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const keys = [...(await AsyncStorage.getAllKeys())];
      keys.sort((a, b) => a.localeCompare(b));
      
      const keyChunks = chunkArray(keys, chunkSize);
      const pairsAll: Array<[string, string | null]> = [];

      for (const kc of keyChunks) {
        if (kc.length === 0) continue;
        const pairs = await AsyncStorage.multiGet(kc);
        pairsAll.push(...(pairs as Array<[string, string | null]>));
      }

      const next: KV[] = pairsAll.map(([key, raw]) => {
        const { pretty, isJson } = parseValue(raw);
        return { key, raw, pretty, isJson };
      });

      setItems(next);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [chunkSize, parseValue]);

  const clearAppKeys = useCallback(async () => {
    const prefix = appKeyPrefix ?? "";
    if (!prefix) {
      Alert.alert(
        "prefix が空です",
        "appKeyPrefix が空だと、全キー削除と同等になり得ます。明示的に設定してください。"
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const allKeys = await AsyncStorage.getAllKeys();
      const targetKeys = allKeys.filter((k) => k.startsWith(prefix)).sort();

      if (targetKeys.length === 0) {
        Alert.alert("対象なし", `prefix "${prefix}" に一致するキーはありません。`);
        return;
      }

      Alert.alert(
        "アプリキーを削除しますか？",
        `prefix "${prefix}" に一致する ${targetKeys.length} 件のキーを削除します。\n（この操作は取り消せません）`,
        [
          { text: "キャンセル", style: "cancel" },
          {
            text: "削除",
            style: "destructive",
            onPress: async () => {
              try {
                setLoading(true);
                const chunks = chunkArray(targetKeys, chunkSize);
                for (const c of chunks) {
                  await AsyncStorage.multiRemove(c);
                }
                // 表示も更新
                await dump();
              } catch (e: any) {
                setError(e?.message ?? String(e));
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [appKeyPrefix, chunkSize, dump]);

  // 展開した瞬間に自動dump
  useEffect(() => {
    if (!open) return;
    if (!autoLoadOnOpen) return;
    if (items.length > 0) return;
    void dump();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      return (
        it.key.toLowerCase().includes(q) ||
        (it.raw ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  const appKeyCount = useMemo(() => {
    const prefix = appKeyPrefix ?? "";
    if (!prefix) return 0;
    return items.reduce((n, it) => (it.key.startsWith(prefix) ? n + 1 : n), 0);
  }, [items, appKeyPrefix]);

  if (hidden) return null;

  return (
    <View style={styles.root}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => [styles.header, pressed ? styles.headerPressed : null]}
      >
        <Text style={styles.headerTitle}>
          {title} {open ? "▾" : "▸"}
        </Text>
        <View style={styles.headerMeta}>
          {loading ? <ActivityIndicator /> : <Text style={styles.metaText}>{items.length} keys</Text>}
        </View>
      </Pressable>

      {open && (
        <View style={styles.panel}>
          <View style={styles.toolbar}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search key/value..."
              placeholderTextColor="#888"
              style={styles.search}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable onPress={dump} style={styles.actionBtn}>
              <Text style={styles.actionText}>Refresh</Text>
            </Pressable>

            <Pressable onPress={clearAppKeys} style={[styles.actionBtn, styles.warnBtn]}>
              <Text style={[styles.actionText, styles.warnText]}>
                Clear App Keys ({appKeyPrefix}* / {appKeyCount})
              </Text>
            </Pressable>

          </View>

          {!!error && <Text style={styles.error}>Error: {error}</Text>}

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {filtered.length === 0 ? (
              <Text style={styles.empty}>
                {items.length === 0 ? "No AsyncStorage items." : "No results."}
              </Text>
            ) : (
              filtered.map((it) => (
                <View
                  key={it.key}
                  style={[
                    styles.item,
                    it.key.startsWith(appKeyPrefix ?? "") ? styles.itemAppKey : null,
                  ]}
                >
                  <View style={styles.itemHeader}>
                    <Text style={styles.key}>{it.key}</Text>
                    <Text style={styles.badge}>
                      {it.key.startsWith(appKeyPrefix ?? "") ? "APP" : "OTHER"} ·{" "}
                      {it.isJson ? "JSON" : "TEXT"}
                    </Text>
                  </View>
                  <Text style={styles.value} selectable>
                    {it.pretty}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          <Text style={styles.footerNote}>
            prefix: "{appKeyPrefix}" / chunkSize: {chunkSize} / {Platform.OS} /{" "}
            {__DEV__ ? "DEV" : "PROD"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
  },
  headerPressed: {
    opacity: 0.85,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    color: "#aaa",
    fontSize: 12,
  },
  panel: {
    padding: 12,
    gap: 10,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  search: {
    flexGrow: 1,
    minWidth: 180,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#0b0b0b",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#0b0b0b",
  },
  actionText: {
    color: "#ddd",
    fontSize: 12,
    fontWeight: "600",
  },
  warnBtn: {
    borderColor: "#5a4a2a",
  },
  warnText: {
    color: "#ffd9a6",
  },
  dangerBtn: {
    borderColor: "#5a2a2a",
  },
  dangerText: {
    color: "#ffb3b3",
  },
  error: {
    color: "#ff8080",
    fontSize: 12,
  },
  scroll: {
    maxHeight: 360,
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 10,
    backgroundColor: "#0b0b0b",
  },
  scrollContent: {
    padding: 10,
    gap: 10,
  },
  empty: {
    color: "#888",
    fontSize: 12,
  },
  item: {
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#0f0f0f",
    gap: 6,
  },
  itemAppKey: {
    borderColor: "#3a3a22",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  key: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    flexShrink: 1,
  },
  badge: {
    color: "#aaa",
    fontSize: 10,
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  value: {
    color: "#ddd",
    fontSize: 12,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    lineHeight: 16,
  },
  footerNote: {
    color: "#666",
    fontSize: 10,
  },
});
