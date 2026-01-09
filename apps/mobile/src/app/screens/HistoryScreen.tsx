import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { getInterruptPorts } from '@/features/interrupt/ports';
import { InterruptionEvent } from '@/domain/interruption';
import { PRESET_TRIGGER_TAGS } from '@/domain/triggerTag';
import { addMinutes } from '@/domain/interruption/factory';
import { ResumeEvent } from '@/domain/resume/types';
import { getResumePorts } from '@/features/resume/ports';
import { useFocusEffect } from '@react-navigation/native';

type Item = InterruptionEvent & {
  tagLabels: string[];
  scheduledLocal?: string | null;
  occurredLocal: string;
  recordedLocal: string;
  resumeStatus?: ResumeEvent['status'];
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
      const { resumeRepo } = getResumePorts();

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

      const resolved = await Promise.all(
        sorted.map(async (ev) => {
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

          const latestResume = await resumeRepo.findLatestByInterruptionId(ev.id);

          return {
            ...ev,
            tagLabels: labels,
            occurredLocal,
            recordedLocal,
            scheduledLocal,
            resumeStatus: latestResume?.status,
          };
        })
      );

      setItems(resolved);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => { };
    }, [load])
  );

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

    const statusLabel = (() => {
      switch (item.resumeStatus) {
        case 'resumed': return '復帰済み';
        case 'snoozed': return 'あとで戻る';
        case 'abandoned': return '未復帰';
        default: return '未復帰';
      }
    })();

    const statusStyle = (() => {
      switch (item.resumeStatus) {
        case 'resumed': return [styles.badge, styles.badgeSuccess];
        case 'snoozed': return [styles.badge, styles.badgeSnooze];
        case 'abandoned': return [styles.badge, styles.badgeAbandoned];
        default: return [styles.badge, styles.badgeAbandoned];
      }
    })();

    return (
      <View>
        {showMonthHeader && (
          <View style={styles.monthHeader}>
            <Text style={styles.monthText}>{curMonth}</Text>
          </View>
        )}
        <View style={[styles.card,
          item.resumeStatus === 'resumed' && styles.cardDone,
          item.resumeStatus === 'snoozed' && styles.cardSnooze,
        ]}>
          <View style={styles.rowSpace}>
            <Text style={styles.title}>{item.occurredLocal}</Text>
            <Text style={statusStyle}>{statusLabel}</Text>
          </View>

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

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top },            // top を手動で1回だけ足す
        ]}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading ? '読み込み中...' : '履歴がありません。休憩を記録するとここに表示されます。'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f9fc' },
  listContent: { padding: 12, gap: 10, },
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

  // styles 追加
  badgeSuccess: { backgroundColor: '#dcfce7', color: '#15803d' },
  badgeSnooze: { backgroundColor: '#fef9c3', color: '#92400e' },
  badgeAbandoned: { backgroundColor: '#fee2e2', color: '#b91c1c' },
  cardDone: { backgroundColor: '#f7fff9', borderColor: '#bbf7d0' },
  cardSnooze: { backgroundColor: '#fffdf3', borderColor: '#fef3c7' },
});