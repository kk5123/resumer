import { useEffect, useMemo, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { InterruptButton, InterruptCaptureModal } from '../../features/interrupt';
import { getInterruptPorts } from '@/features/interrupt/ports';
import { getResumePorts } from '@/features/resume/ports';
import { createResumeEvent } from '@/domain/resume/factory';
import { InterruptionEvent } from '@/domain/interruption';
import { ResumeEvent } from '@/domain/resume/types';
import { useToast } from '@/shared/components/ToastProvider';

export default function HomeScreen() {
  const [visible, setVisible] = useState(false);
  const [latest, setLatest] = useState<InterruptionEvent | null>(null);
  const [latestResume, setLatestResume] = useState<ResumeEvent | null>(null);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  const { interruptionRepo } = getInterruptPorts();
  const { resumeRepo } = getResumePorts();

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(t);
  }, []);

  const resumeDiff = useMemo(() => {
    if (!latest?.scheduledResumeAt) return { text: '予定未設定', isLate: false };
    const scheduled = new Date(latest.scheduledResumeAt).getTime();
    if (Number.isNaN(scheduled)) return { text: '予定未設定', isLate: false };

    const diffMs = now - scheduled; // 遅延なら正、早着なら負にしてもOKだがここでは遅延=正にするか逆に合わせるか決める
    const diffMin = Math.round(diffMs / 60000); // 遅延なら正、予定より早いなら負
    const sign = diffMin > 0 ? '+' : diffMin < 0 ? '-' : '±';
    const absMin = Math.abs(diffMin);
    const text =
      absMin === 0 ? '±0分（予定どおり）' : `${sign}${absMin}分`;

    return { text, isLate: diffMin > 0 };
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
    return latestResume.status !== 'resumed'; // 復帰済みなら非表示
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
    showToast('復帰を記録しました。作業を再開しましょう！', { type: 'success' });
  };

  const handleSnooze5 = async () => {
    if (!latest) return;
    const event = createResumeEvent({ interruptionId: latest.id, status: 'snoozed', snoozeMinutes: 5 });
    await resumeRepo.save(event);
    setLatestResume(event);
    showToast('休憩を5分延長しました。(通知は未実装)', { type: 'info' });
  };

  const handleAbandon = async () => {
    if (!latest) return;
    const event = createResumeEvent({ interruptionId: latest.id, status: 'abandoned' });
    await resumeRepo.save(event);
    setLatestResume(event);
    showToast('作業を終了しました', { type: 'success' });
  };

  return (
    <View style={styles.container}>
      <InterruptButton onPress={() => setVisible((v) => !v)} />
      <InterruptCaptureModal
        visible={visible}
        onCancel={() => setVisible(false)}
        onSave={async () => { await loadLatest(); setVisible(false); }}
      />

      {shouldShowCard && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>最新の作業中断</Text>
          {loading && <ActivityIndicator />}
          {!loading && latest && (
            <>
              <Text style={styles.label}>発生: {formattedOccurred}</Text>
              <View style={styles.rowInline}>
                <Text style={styles.label}>
                  予定復帰: {latest.scheduledResumeAt ? new Date(latest.scheduledResumeAt).toLocaleString('ja-JP') : '未設定'}
                </Text>
                <Text style={[styles.labelEmphasis, resumeDiff.isLate && styles.labelLate]}>
                  {resumeDiff.text}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.primary} onPress={handleResume}>
                  <Text style={styles.primaryText}>復帰する</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondary} onPress={handleSnooze5}>
                  <Text style={styles.secondaryText}>5分延長する</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.danger} onPress={handleAbandon}>
                  <Text style={styles.dangerText}>終了する</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

      {!loading && !latest && (
        <Text style={styles.empty}>
          まだ休憩の記録はありません。{'\n'}上のボタンで初回の休憩を記録できます。
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 16 },
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
  rowInline: { flexDirection: 'row', alignItems: 'center', gap: '10', },
  empty: { marginTop: 16, color: '#6b7280', textAlign: 'center', fontSize: 14 },
});
