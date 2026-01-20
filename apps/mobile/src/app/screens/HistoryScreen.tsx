import { FlatList, RefreshControl, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { t } from '@/shared/i18n/strings';
import { HistoryItem, HistoryCard, useHistory } from '@/features/history';

import { HistoryFilter } from './components/HistoryFilter';
import { DateRange } from '@/domain/common.types';
import { useState } from 'react';
import { Header } from '@/shared/components';

export function HistoryScreen() {
  const navigation = useNavigation();

  const [range, setRange] = useState<DateRange>({});

  const { data: items, loading } = useHistory({ from: range.from, to: range.to, limit: 50 });  
  const latest = items[0] ?? null;
  const latestOpen = latest && latest.resumeStatus !== 'abandoned' && latest.resumeStatus !== 'resumed' ? latest : null;

  const listItems = latestOpen ? items.slice(1) : items;

  const monthKey = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const renderItem = ({ item, index }: { item: HistoryItem; index: number }) => {
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
        <HistoryCard item={item} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <Header title={t('nav.history')} onLeftPress={() => navigation.goBack()} />
      <HistoryFilter onChange={setRange} />
      <FlatList
        data={listItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => { /* useHistory は自動更新なので不要なら空で */ }} />
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
  listContent: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 16, gap: 10 },
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
