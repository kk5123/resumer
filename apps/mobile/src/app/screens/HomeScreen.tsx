import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { InterruptButton, InterruptCaptureModal } from '@/features/interrupt';
import { t } from '@/shared/i18n/strings';
import { formatDiffHuman } from '@/shared/utils/date';
import { useInterruptionActions } from '@/shared/actions/useInterruptionActions';
import { useHistory, HistoryCard } from '@/features/history';

function Header({ onPressSettings }: { onPressSettings: () => void }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{t('app.title')}</Text>
      <TouchableOpacity onPress={onPressSettings} style={styles.headerButton} hitSlop={8}>
        <Ionicons name="settings-outline" size={22} color="#1f2937" />
      </TouchableOpacity>
    </View>
  );
}

type RootStackParamList = { Home: undefined; History: undefined };

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [visible, setVisible] = useState(false);

  // 履歴（最新含む）をまとめて取得
  const { items: historyItems, loading: historyLoading, reload: reloadHistory } = useHistory({ limit: 3 });
  const latest = historyItems[0] ?? null;

  const { markResumed, markSnoozed, markAbandoned } = useInterruptionActions();

  // 差分表示用に現在時刻を更新（1秒ごと）
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tId);
  }, []);

  const resumeDiff = useMemo(() => {
    if (!latest?.scheduledResumeAt) return { text: t('home.label.scheduledUnset'), isLate: false };
    const scheduled = new Date(latest.scheduledResumeAt).getTime();
    if (Number.isNaN(scheduled)) return { text: t('home.label.scheduledUnset'), isLate: false };
    const diffMs = now - scheduled;
    return { text: formatDiffHuman(diffMs, { includeSeconds: true }), isLate: diffMs > 0 };
  }, [latest?.scheduledResumeAt, now]);

  const handleResume = async () => {
    if (!latest) return;
    await markResumed(latest.id);
    await reloadHistory();
  };

  const handleSnooze5 = async () => {
    if (!latest) return;
    await markSnoozed(latest.id, 5);
    await reloadHistory();
  };

  const handleAbandon = async () => {
    if (!latest) return;
    await markAbandoned(latest.id);
    await reloadHistory();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header onPressSettings={() => { }} />

      <InterruptButton onPress={() => setVisible((v) => !v)} />
      {visible && (
        <InterruptCaptureModal
          visible={visible}
          onCancel={() => setVisible(false)}
          onSave={async () => { await reloadHistory(); setVisible(false); }}
        />
      )}

      <ScrollView style={styles.recentSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>{t('nav.history')}（最新3件）</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.sectionLink}>{t('common.showAll')}</Text>
          </TouchableOpacity>
        </View>
        {historyItems.map((it, idx) => (
          <HistoryCard
            key={it.id}
            item={it}
            isLatest={idx === 0}
            onResume={handleResume}
            onSnooze={handleSnooze5}
            onAbandon={handleAbandon}
          />
        ))}
        {historyItems.length === 0 && !historyLoading && (
          <Text style={styles.recentEmpty}>{t('history.empty')}</Text>
        )}
      </ScrollView>

      {!historyLoading && !latest && (
        <Text style={styles.empty}>{t('home.empty')}</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    width: '100%',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  headerButton: { paddingHorizontal: 6 },
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'flex-start', padding: 16 },
  card: { width: '100%', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, gap: 8, marginTop: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  label: { fontSize: 13, color: '#1f2937' },
  labelEmphasis: { fontSize: 14, fontWeight: '700', color: '#111' },
  labelLate: { color: '#b91c1c' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  primary: { flex: 1, backgroundColor: '#2563eb', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondary: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  secondaryText: { color: '#374151', fontWeight: '700' },
  danger: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerText: { color: '#b91c1c', fontWeight: '700' },
  recentSection: { width: '100%', marginTop: 16 },
  sectionHeader: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 8 },
  recentEmpty: { fontSize: 12, color: '#9ca3af', textAlign: 'center', paddingVertical: 8 },
  empty: { marginTop: 16, color: '#6b7280', textAlign: 'center', fontSize: 14 },
  rowSpace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sectionLink: { fontSize: 13, color: '#2563eb', fontWeight: '700' },
});