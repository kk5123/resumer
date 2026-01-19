import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { InterruptButton, InterruptCaptureModal } from '@/features/interrupt';
import { t } from '@/shared/i18n/strings';
import { useResumeDiff } from './hooks/useResumeDiff';
import { useResumeActions } from '@/features/resume/hooks/useResumeActions';
import { useHistory } from '@/features/history';

import { RootStackParamList } from '../navigation/RootNavigator';

import { SummaryCard, useWeekSummary } from '@/features/summary';

import { upsertResumeNotification, useNotificationResponse } from '@/features/notification';
import { InterruptionEvent } from '@/domain/interruption';
import { LatestOpenCard } from './components/LatestOpenCard';
import { formatDiffHuman } from '@/shared/utils/date';
import { ScrollView } from 'react-native';

type HeaderActions = {
  onPressHistory: () => void;
  onPressSettings: () => void;
}

function Header({ onPressHistory, onPressSettings }: HeaderActions) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTitleContainer}>
        <Image
          source={require('../../../assets/icon.png')}
          style={styles.headerIcon}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>{t('app.title')}</Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={onPressHistory} style={styles.headerButton} hitSlop={8}>
          <Ionicons name="time-outline" size={22} color="#1f2937" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressSettings} style={styles.headerButton} hitSlop={8}>
          <Ionicons name="settings-outline" size={22} color="#1f2937" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [visible, setVisible] = useState(false);

  const { summary, loading: summaryLoading, weekRangeLabel, reload: reloadSummary } = useWeekSummary(200);

  // 履歴を取得（ホームは最新1件のみ表示対象）
  const { items: historyItems, loading: historyLoading, reload: reloadHistory } = useHistory({ limit: 1 });
  const latest = historyItems[0] ?? null;
  const latestOpen = latest && latest.resumeStatus !== 'abandoned' && latest.resumeStatus !== 'resumed' ? latest : null;
  const hasAnyHistory = historyItems.length > 0;

  const [highlight, setHighlight] = useState<boolean>(false);

  const { markResumed, markSnoozed, markAbandoned } = useResumeActions(latestOpen,
    async () => {
      await reloadHistory();
      await reloadSummary();
    });

  const { diffMs, reload: reloadResumeDiff } = useResumeDiff(latestOpen?.id);
  const resumeDiff = useMemo(() => {
    if (diffMs === null) {
      return { text: t('home.label.scheduledUnset'), isLate: false };
    }
    return {
      text: formatDiffHuman(diffMs, { includeSeconds: true }),
      isLate: diffMs > 0,
    };
  }, [diffMs]);

  const hideHighlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNotificationOpen = useCallback(() => {
    setHighlight(true);
    if (hideHighlightTimer.current) clearTimeout(hideHighlightTimer.current);
    hideHighlightTimer.current = setTimeout(() => setHighlight(false), 4000);
  }, []);

  useNotificationResponse(handleNotificationOpen);

  // アンマウント時にタイマーを掃除
  useEffect(() => {
    return () => {
      if (hideHighlightTimer.current) clearTimeout(hideHighlightTimer.current);
    };
  }, []);

  const handleInterruptionSaved = async (e: InterruptionEvent) => {
    await reloadHistory();
    setVisible(false);

    if (e.scheduledResumeAt)
      upsertResumeNotification({
        interruptionId: e.id,
        title: t('app.title'),
        body: e.context.firstStepText || t('notification.fallback'),
        triggerDate: new Date(e.scheduledResumeAt)
      });
  };

  const handleInterruptButtonPress = useCallback(() => {
    if (latestOpen) {
      Alert.alert(
        '前回の中断があります',
        '新しい中断を記録する前に、既存の中断を終了してください',
        [
          { text: 'キャンセル', style: 'cancel', },
          { text: '終了して新規記録', style: 'destructive', onPress: async () => { await markAbandoned(); setVisible(true); }, },
        ]
      );
    } else {
      setVisible(true);
    }
  }, [latestOpen, markAbandoned]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header
        onPressHistory={() => navigation.navigate('History')}
        onPressSettings={() => navigation.navigate('Settings')}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!summaryLoading && (
          <SummaryCard
            dateLabel="今週"
            weekRange={weekRangeLabel}
            total={summary.total}
            resumed={summary.resumed}
            abandoned={summary.abandoned}
            snoozed={summary.snoozed}
            frequentTrigger={summary.frequentTrigger}
          />
        )}

        <InterruptButton onPress={handleInterruptButtonPress} />
        {visible && (
          <InterruptCaptureModal
            visible={visible}
            onCancel={() => setVisible(false)}
            onSave={handleInterruptionSaved}
          />
        )}

        {latestOpen && (
          <LatestOpenCard
            latestOpen={latestOpen}
            highlight={highlight}
            resumeDiff={resumeDiff}
            onResume={markResumed}
            onSnooze5={async () => { await markSnoozed(); reloadResumeDiff(); }}
            onAbandon={markAbandoned}
          />
        )}

        {!latestOpen && !historyLoading && !hasAnyHistory && (
          <Text style={styles.recentEmpty}>{t('home.empty')}</Text>
        )}
      </ScrollView>
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 60,
    height: 60,
    marginLeft: -20,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerButton: { paddingHorizontal: 6 },
  container: { 
    flex: 1, 
    backgroundColor: '#fcfcfc', 
    alignItems: 'center', 
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingTop: 8,
    alignItems: 'center',
  },
  card: { width: '100%', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, gap: 8, marginTop: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  label: { fontSize: 13, color: '#1f2937' },
  labelEmphasis: { fontSize: 14, fontWeight: '700', color: '#111' },
  labelLate: { color: '#b91c1c' },
  subLabel: { fontSize: 12, color: '#4b5563', marginBottom: 4 },
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
  sectionLinkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 4 },
  sectionLink: { fontSize: 13, color: '#2563eb', fontWeight: '700' },
  resumeRow: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    gap: 4,
    marginBottom: 8,
  },
  historyButton: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  historyButtonText: { fontSize: 14, fontWeight: '700', color: '#2563eb' },
  latestCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  badge: {
    fontSize: 11,
    color: '#1f2937',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  metaLabel: { fontSize: 12, color: '#6b7280' },
  metaValue: { flex: 1, fontSize: 13, color: '#111', textAlign: 'right' },

  latestCardHighlight: {
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
});