import { FlatList, RefreshControl, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { t } from '@/shared/i18n/strings';
import { HistoryItem, HistoryCard, useHistory } from '@/features/history';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useResumeActions } from '@/features/resume/hooks/useResumeActions';

import { HistoryFilter } from './components/HistoryFilter';
import { DateRange } from '@/domain/common.types';

export function HistoryScreen() {
  const navigation = useNavigation();

  const [range, setRange] = useState<DateRange>({});

  const { items, loading, reload } = useHistory({ from: range.from, to: range.to, limit: 50 });  
  const latest = items[0] ?? null;
  const latestOpen = latest && latest.resumeStatus !== 'abandoned' && latest.resumeStatus !== 'resumed' ? latest : null;


  const { markResumed, markSnoozed, markAbandoned } = useResumeActions(latestOpen);

  const handleResume = useCallback(async () => {
    await markResumed();
    await reload();
  }, [markResumed, reload]);

  const handleSnooze = useCallback(async () => {
    await markSnoozed(5);
    await reload();
  }, [markSnoozed, reload]);

  const handleAbandon = useCallback(async () => {
    await markAbandoned();
    await reload();
  }, [markAbandoned, reload]);

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
        <HistoryCard
          item={item}
          isLatest={index === 0}
          onResume={index === 0 && latestOpen ? handleResume : undefined}
          onSnooze={index === 0 && latestOpen ? handleSnooze : undefined}
          onAbandon={index === 0 && latestOpen ? handleAbandon : undefined}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('nav.history')}</Text>
      </View>
      <HistoryFilter onChange={setRange} />
      <FlatList
        data={items}
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
  header: {
    position: 'relative',
    paddingHorizontal: 16,
    paddingBottom: 12,
    minHeight: 56,            // ヘッダー高さを安定させる
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // タイトル中央
    backgroundColor: '#f7f9fc',
  },
  backButton: {
    position: 'absolute',
    left: 16,                 // 左端寄せ
    height: 40,
    width: 40,
    justifyContent: 'center', // アイコン縦中央
    alignItems: 'flex-start', // 左寄せ
    paddingVertical: 0,
    paddingRight: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },
  listContent: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 16, gap: 10 },

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