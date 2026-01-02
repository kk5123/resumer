import { useCallback, useEffect, useState } from 'react';
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

type Item = InterruptionEvent & {
  tagLabels: string;
};

export function HistoryScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { interruptionRepo, customTriggerTagRepo } = getInterruptPorts();

      const [events, customTags] = await Promise.all([
        interruptionRepo.listRecent(50),
        customTriggerTagRepo.listTopUsed(200), // ラベル解決用
      ]);

      const presetMap = new Map(PRESET_TRIGGER_TAGS.map((t) => [t.id, t.label]));
      const customMap = new Map(customTags.map((t) => [t.id, t.label]));

      const resolved = events.map((ev) => {
        const labels = ev.context.triggerTagIds.map((id) => {
          return presetMap.get(id) ?? customMap.get(id) ?? id;
        });
        return { ...ev, tagLabels: labels.join(', ') };
      });

      setItems(resolved);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.occurredAt}</Text>
      <Text style={styles.meta}>Recorded: {item.recordedAt}</Text>
      <Text style={styles.meta}>Tags: {item.tagLabels || '-'}</Text>
      <Text style={styles.body}>Reason: {item.context.reasonText || '-'}</Text>
      <Text style={styles.body}>First step: {item.context.firstStepText || '-'}</Text>
      <Text style={styles.meta}>
        Return after: {item.context.returnAfterMinutes ?? '-'} min
      </Text>
    </View>
  );

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
    gap: 4,
  },
  title: { fontSize: 14, fontWeight: '700', color: '#111' },
  meta: { fontSize: 12, color: '#6b7280' },
  body: { fontSize: 13, color: '#1f2937' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 24 },
});