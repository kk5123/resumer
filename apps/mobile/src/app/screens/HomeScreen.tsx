import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { InterruptButton, InterruptCaptureModal } from '../../features/interrupt';
import { getInterruptPorts } from '@/features/interrupt/ports';
import { getResumePorts } from '@/features/resume/ports';
import { InterruptionEvent } from '@/domain/interruption';
import { createResumeEvent } from '@/domain/resume/factory';

export default function HomeScreen() {
  const [visible, setVisible] = useState(false);
  const [latest, setLatest] = useState<InterruptionEvent | null>(null);
  const [loading, setLoading] = useState(false);

  const { interruptionRepo } = getInterruptPorts();
  const { resumeRepo } = getResumePorts();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const ev = await interruptionRepo.findLatest();
        setLatest(ev);
      } finally {
        setLoading(false);
      }
    })();
  }, [interruptionRepo]);

  const formattedOccurred = useMemo(() => {
    if (!latest) return '';
    const d = new Date(latest.occurredAt);
    return Number.isNaN(d.getTime()) ? latest.occurredAt : d.toLocaleString('ja-JP');
  }, [latest]);

  const handleResume = async () => {
    if (!latest) return;
    const event = createResumeEvent({
      interruptionId: latest.id,
      status: 'resumed',
    });
    await resumeRepo.save(event);
  };

  const handleSnooze5 = async () => {
    if (!latest) return;
    const event = createResumeEvent({
      interruptionId: latest.id,
      status: 'snoozed',
      snoozeMinutes: 5,
    });
    await resumeRepo.save(event);
  };

  return (
    <View style={styles.container}>
      {/* 既存 */}
      <InterruptButton onPress={() => setVisible((v) => !v)} />
      <InterruptCaptureModal
        visible={visible}
        onCancel={() => setVisible(false)}
        onSave={() => setVisible(false)}
      />

      {/* 直近中断カード */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>直近の中断</Text>
        {loading && <ActivityIndicator />}
        {!loading && !latest && <Text style={styles.muted}>まだ記録がありません</Text>}
        {!loading && latest && (
          <>
            <Text style={styles.label}>発生: {formattedOccurred}</Text>
            <Text style={styles.label}>
              予定復帰: {latest.scheduledResumeAt ? new Date(latest.scheduledResumeAt).toLocaleString('ja-JP') : '未設定'}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.primary} onPress={handleResume}>
                <Text style={styles.primaryText}>復帰する</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondary} onPress={handleSnooze5}>
                <Text style={styles.secondaryText}>あと5分</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
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
});
