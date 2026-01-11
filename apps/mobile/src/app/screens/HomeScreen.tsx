import { useEffect, useMemo, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { InterruptButton, InterruptCaptureModal } from '../../features/interrupt';
import { getInterruptPorts } from '@/features/interrupt/ports';
import { getResumePorts } from '@/features/resume/ports';
import { createResumeEvent } from '@/domain/resume/factory';
import { InterruptionEvent } from '@/domain/interruption';
import { ResumeEvent } from '@/domain/resume/types';
import { useToast } from '@/shared/components/ToastProvider';
import { t } from '@/shared/i18n/strings';
import { formatDiffHuman } from '@/shared/utils/date';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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

export default function HomeScreen() {
  const [visible, setVisible] = useState(false);
  const [latest, setLatest] = useState<InterruptionEvent | null>(null);
  const [latestResume, setLatestResume] = useState<ResumeEvent | null>(null);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  const { interruptionRepo } = getInterruptPorts();
  const { resumeRepo } = getResumePorts();

  const [now, setNow] = useState(() => Date.now());
  // now 更新間隔を 1秒に（負荷が気になるなら2〜5秒でも可）
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const resumeDiff = useMemo(() => {
    if (!latest?.scheduledResumeAt) return { text: t('home.label.scheduledUnset'), isLate: false };
    const scheduled = new Date(latest.scheduledResumeAt).getTime();
    if (Number.isNaN(scheduled)) return { text: t('home.label.scheduledUnset'), isLate: false };

    const diffMs = now - scheduled; // 遅延なら正、早ければ負
    const isLate = diffMs > 0;
    const text = formatDiffHuman(diffMs, { includeSeconds: true });

    return { text, isLate };
  }, [latest?.scheduledResumeAt, now]);

  const loadLatest = useCallback(async () => {
    setLoading(true);
    try {
      const ev = await interruptionRepo.findLatest();
      setLatest(ev);
      if (ev) {
        const r = await resumeRepo.findLatestByInterruptionId(ev.id);
        setLatestResume(r);
      } else {
        setLatestResume(null);
      }
    } finally {
      setLoading(false);
    }
  }, [interruptionRepo, resumeRepo]);

  useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  const shouldShowCard = useMemo(() => {
    if (!latest) return false;
    if (!latestResume) return true; // 復帰記録なし -> 表示
    return !['resumed', 'abandoned'].includes(latestResume.status);
  }, [latest, latestResume]);

  const formattedOccurred = useMemo(() => {
    if (!latest) return '';
    const d = new Date(latest.occurredAt);
    return Number.isNaN(d.getTime()) ? latest.occurredAt : d.toLocaleString('ja-JP');
  }, [latest]);

  const handleResume = async () => {
    if (!latest) return;
    const event = createResumeEvent({ interruptionId: latest.id, status: 'resumed' });
    await resumeRepo.save(event);
    setLatestResume(event); // 即時反映
    showToast(t('home.toast.resume'), { type: 'success' });
  };

  const handleSnooze5 = async () => {
    if (!latest) return;
    const event = createResumeEvent({ interruptionId: latest.id, status: 'snoozed', snoozeMinutes: 5 });
    await resumeRepo.save(event);
    setLatestResume(event);
    showToast(t('home.toast.snooze'), { type: 'info' });
  };

  const handleAbandon = async () => {
    if (!latest) return;
    const event = createResumeEvent({ interruptionId: latest.id, status: 'abandoned' });
    await resumeRepo.save(event);
    setLatestResume(event);
    showToast(t('home.toast.abandon'), { type: 'success' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <Header onPressSettings={() => { }} />

      <InterruptButton onPress={() => setVisible((v) => !v)} />
      <InterruptCaptureModal
        visible={visible}
        onCancel={() => setVisible(false)}
        onSave={async () => { await loadLatest(); setVisible(false); }}
      />

      {shouldShowCard && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('home.card.title')}</Text>
          {loading && <ActivityIndicator />}
          {!loading && latest && (
            <>
              <Text style={styles.label}>{t('home.label.occurred')}: {formattedOccurred}</Text>
              <View style={styles.rowInline}>
                <Text style={styles.label}>
                  {t('home.label.scheduled')}: {latest.scheduledResumeAt ? new Date(latest.scheduledResumeAt).toLocaleString('ja-JP') : t('home.label.scheduledUnset')}
                </Text>
                <Text style={[styles.labelEmphasis, resumeDiff.isLate && styles.labelLate]}>
                  {resumeDiff.text}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.primary} onPress={handleResume}>
                  <Text style={styles.primaryText}>{t('home.button.resume')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondary} onPress={handleSnooze5}>
                  <Text style={styles.secondaryText}>{t('home.button.snooze5')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.danger} onPress={handleAbandon}>
                  <Text style={styles.dangerText}>{t('home.button.abandon')}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

      {!loading && !latest && (
        <Text style={styles.empty}>
          {t('home.empty')}
        </Text>
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
  headerButton: {
    paddingHorizontal: 6,
  },
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'flex-start', padding: 16 },
  card: { width: '100%', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, gap: 8, marginTop: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  label: { fontSize: 13, color: '#1f2937' },
  muted: { fontSize: 13, color: '#9ca3af' },
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

  labelEmphasis: { fontSize: 14, fontWeight: '700', color: '#111' },
  labelLate: { color: '#b91c1c' }, // 遅延時に赤
  rowInline: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  empty: { marginTop: 16, color: '#6b7280', textAlign: 'center', fontSize: 14 },
});
