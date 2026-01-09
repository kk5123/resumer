import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getInterruptPorts } from '@/features/interrupt/ports';
import { InterruptionEvent } from '@/domain/interruption';
import { PRESET_TRIGGER_TAGS } from '@/domain/triggerTag';
import { addMinutes } from '@/domain/interruption/factory';

type Item = InterruptionEvent & {
  tagLabels: string[];
  scheduledLocal?: string | null;
  occurredLocal: string;
  recordedLocal: string;
};

function formatLocalShort(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',   // 3
    day: 'numeric',     // 12
    weekday: 'short',   // (火)
    hour: '2-digit',    // 14
    minute: '2-digit',  // 05
    hourCycle: 'h23',   // 24時間表記
  }).format(d);
}

export function HistoryScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { interruptionRepo, customTriggerTagRepo } = getInterruptPorts();

      const [events, customTags] = await Promise.all([
        interruptionRepo.listRecent(50),            // 取得は新しい順 (実装依存)
        customTriggerTagRepo.listTopUsed(200),      // ラベル解決用
      ]);

      const presetMap = new Map(PRESET_TRIGGER_TAGS.map((t) => [t.id, t.label]));
      const customMap = new Map(customTags.map((t) => [t.id, t.label]));

      // 念のため occurredAt で新しい順にソート
      const sorted = [...events].sort(
        (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      );

      const resolved = sorted.map((ev) => {
        const labels = (ev.context.triggerTagIds ?? []).map((id) => {
          return presetMap.get(id) ?? customMap.get(id) ?? id;
        });
        const occurredLocal = formatLocalShort(ev.occurredAt);
        const recordedLocal = formatLocalShort(ev.recordedAt);
        const scheduled =
          ev.context.returnAfterMinutes != null
            ? addMinutes(ev.occurredAt, ev.context.returnAfterMinutes)
            : null;
        const scheduledLocal = scheduled ? formatLocalShort(scheduled) : null;

        return {
          ...ev,
          tagLabels: labels,           // 常に配列
          occurredLocal,
          recordedLocal,
          scheduledLocal,
        };
      });

      setItems(resolved);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function monthKey(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  const renderItem = ({ item, index }: { item: Item; index: number }) => {
    const prev = items[index - 1];
    const curMonth = monthKey(item.occurredAt);
    const prevMonth = prev ? monthKey(prev.occurredAt) : null;
    const showMonthHeader = index === 0 || curMonth !== prevMonth;

    const tags = item.tagLabels ?? [];

    return (
      <View>
        {showMonthHeader && (
          <View style={styles.monthHeader}>
            <Text style={styles.monthText}>{curMonth}</Text>
          </View>
        )}
        <View style={styles.card}>
          <View style={styles.rowSpace}>
            <Text style={styles.title}>{item.occurredLocal}</Text>
            <Text style={styles.badge}>新しい順</Text>
          </View>
          <Text style={styles.meta}>記録: {item.recordedLocal}</Text>

          <View style={styles.tagRow}>
            {item.tagLabels.length === 0 ? (
              <Text style={styles.tagEmpty}>タグなし</Text>
            ) : (
              item.tagLabels.map((label, idx) => (
                <View key={idx} style={styles.chip}>
                  <Text style={styles.chipText}>{label}</Text>
                </View>
              ))
            )}
          </View>

          <Text style={styles.body}>理由: {item.context.reasonText || '-'}</Text>
          <Text style={styles.body}>復帰後の初手: {item.context.firstStepText || '-'}</Text>
          <Text style={styles.meta}>
            予定復帰まで: {item.context.returnAfterMinutes ?? '-'} 分
          </Text>
          {item.scheduledLocal && (
            <Text style={styles.meta}>予定復帰時刻: {item.scheduledLocal}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading ? '読み込み中...' : '履歴がありません'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f9fc' },
  listContent: { padding: 12, gap: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  rowSpace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 15, fontWeight: '700', color: '#111' },
  badge: {
    fontSize: 10,
    color: '#1f2937',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  meta: { fontSize: 12, color: '#6b7280' },
  body: { fontSize: 13, color: '#1f2937' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: {
    backgroundColor: '#e8f2ff',
    borderColor: '#c7dbff',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: { fontSize: 12, color: '#1f4fa0', fontWeight: '600' },
  tagEmpty: { fontSize: 12, color: '#9ca3af' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 24 },
  monthHeader: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    marginBottom: 6,
  },
  monthText: {
    color: '#4b5563',
    fontWeight: '700',
    fontSize: 13,
  },
});