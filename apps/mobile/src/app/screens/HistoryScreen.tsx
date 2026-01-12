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
import { t } from '@/shared/i18n/strings';
import { formatLocalShort } from '@/shared/utils/date';
import { HistoryCard } from '@/features/history';

type Item = InterruptionEvent & {
  tagLabels: string[];
  scheduledLocal?: string | null;
  occurredLocal: string;
  recordedLocal: string;
  resumeStatus?: ResumeEvent['status'];
};

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

    return (
      <View>
        {showMonthHeader && (
          <View style={styles.monthHeader}>
            <Text style={styles.monthText}>{curMonth}</Text>
          </View>
        )}
        <HistoryCard
          item={item}
          isLatest={index===0}
        />
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
            {loading ? t('common.loading') : t('history.empty')}
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
  badgeOnBreak: { backgroundColor: '#fef9c3', color: '#92400e' },
  badgeAbandoned: { backgroundColor: '#fee2e2', color: '#b91c1c' },
  cardDone: { backgroundColor: '#f7fff9', borderColor: '#bbf7d0' },
  cardSnooze: { backgroundColor: '#fffdf3', borderColor: '#fef3c7' },
});