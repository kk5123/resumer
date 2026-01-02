import { useState, useMemo } from 'react';

import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { TriggerTagPicker, TriggerTagPickerHandle } from './TriggerTagPicker';

import { TriggerTag } from '@/domain/triggerTag';
import { useEffect, useRef } from 'react';
import { getInterruptPorts } from '../ports';
import { createInterruptionEvent } from '@/domain/interruption';

export type InterruptCaptureModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSave: () => void;
};

export type InterruptionDraft = {
  reasonText: string;
  firstStepText: string;
  returnAfterMinutes: number;
};

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

export function InterruptCaptureModal(props: InterruptCaptureModalProps) {
  const { visible, onCancel, onSave } = props;
  const [ready, setReady] = useState(false);
  const [initialCustomTags, setInitialCustomTags] = useState<TriggerTag[]>([]);

  const [occurredAt, setOccurredAt] = useState<string | null>(null);

  const tagPickerRef = useRef<TriggerTagPickerHandle | null>(null);

  useEffect(() => {
    let mounted = true;

    if (visible) {
      setOccurredAt(new Date().toISOString());

      (async () => {
        const { customTriggerTagRepo } = getInterruptPorts();
        const tags = await customTriggerTagRepo.listTopUsed(10);
        if (mounted) setInitialCustomTags(tags);
      })();
    } else {
      setOccurredAt(null);
    }
  }, [visible]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { customTriggerTagRepo } = getInterruptPorts();
      const tags = await customTriggerTagRepo.listTopUsed(10);
      if (mounted) {
        setInitialCustomTags(tags);
        setReady(true);
      }
    })();
    return () => { mounted = false; };
  }, []);


  const [draft, setDraft] = useState<InterruptionDraft>({
    reasonText: '',
    firstStepText: '',
    returnAfterMinutes: 5,
  });

  const quickMinutes = useMemo(() => [5, 10, 25, 60], []);

  const minutesMin = 1;
  const minutesMax = 240;

  const handleCancel = () => {
    onCancel();
  }

  const handleSave = async () => {
    if (!occurredAt) return;

    const now = new Date().toISOString();

    const selection = tagPickerRef.current?.getSelection();
    const triggerTagIds = selection?.selectedIds ?? [];
    const selectedCustomTags = selection?.customTags ?? [];
    console.log(triggerTagIds, selectedCustomTags);

    try {
      const { interruptionRepo, customTriggerTagRepo } = getInterruptPorts();
      if (selectedCustomTags.length > 0) {
        await customTriggerTagRepo.upsertUsage(selectedCustomTags, now);
      }

      const event = createInterruptionEvent({
        occurredAt,
        recordedAt: now,
        context: {
          triggerTagIds,
          reasonText: draft.reasonText,
          firstStepText: draft.firstStepText,
          returnAfterMinutes: draft.returnAfterMinutes
        }
      })

      await interruptionRepo.save(event);
      onSave();
      console.log('[InterruptionCaptureModal] saved', event.id);
    } catch (e) {
      console.error('[InterruptionCaptureModal] save error', e);
    }
  };

  if (!ready) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      presentationStyle='fullScreen'
      animationType='slide'
      onRequestClose={handleCancel}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleCancel} hitSlop={12}>
              <Text style={styles.headerClose}>×</Text>
            </Pressable>
            <Text style={styles.headerTitle}>中断</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps='handled'>
            <Text style={styles.sectionTitle}>きっかけ</Text>
            <TriggerTagPicker
              ref={tagPickerRef}
              initialCustomTags={initialCustomTags}
            />

            <Text style={styles.caption}>理由メモ</Text>
            <TextInput
              value={draft.reasonText}
              onChangeText={(t) => setDraft((d) => ({ ...d, reasonText: t }))}
              style={styles.input}
              multiline={false}
              returnKeyType="done"
            />

            <Text style={styles.caption}>戻ったら最初にやること</Text>
            <TextInput
              value={draft.firstStepText}
              onChangeText={(t) => setDraft((d) => ({ ...d, firstStepText: t }))}
              style={styles.input}
              multiline={false}
              returnKeyType="done"
            />

            <Text style={styles.sectionTitle}>何分後に戻れそう？</Text>

            <View style={[styles.row, { alignItems: "center" }]}>
              <Pressable
                onPress={() =>
                  setDraft((d) => ({
                    ...d,
                    returnAfterMinutes: clampInt(d.returnAfterMinutes - 1, minutesMin, minutesMax),
                  }))
                }
                style={styles.stepperButton}
              >
                <Text style={styles.stepperText}>-</Text>
              </Pressable>

              <View style={styles.minutesBox}>
                <Text style={styles.minutesValue}>{draft.returnAfterMinutes}</Text>
                <Text style={styles.minutesLabel}>分</Text>
              </View>
              <Pressable
                onPress={() =>
                  setDraft((d) => ({
                    ...d,
                    returnAfterMinutes: clampInt(d.returnAfterMinutes + 1, minutesMin, minutesMax),
                  }))
                }
                style={styles.stepperButton}
              >
                <Text style={styles.stepperText}>+</Text>
              </Pressable>
            </View>

            <View style={styles.quickRow}>
              {quickMinutes.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setDraft((d) => ({ ...d, returnAfterMinutes: m }))}
                  style={styles.quickButton}
                >
                  <Text style={styles.quickButtonText}>{m}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable
              onPress={handleSave}
              style={[styles.footerButton, styles.footerPrimary]}
            >
              <Text style={styles.footerPrimaryText}>休憩する</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6fbff' },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerClose: { fontSize: 28 },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  caption: { marginTop: 10, marginBottom: 6, fontSize: 13, opacity: 0.7 },
  row: { flexDirection: 'row', gap: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  smallButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  smallButtonText: { fontWeight: '600' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { fontSize: 13 },
  stepperButton: {
    borderWidth: 1,
    borderRadius: 12,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: { fontSize: 20, fontWeight: '700' },
  minutesBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    width: 90,
  },
  minutesValue: { fontSize: 28, fontWeight: '700' },
  minutesLabel: { marginLeft: 6, fontSize: 14, opacity: 0.7 },
  quickRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  quickButton: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  quickButtonText: { fontWeight: '600' },
  footer: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerSecondary: { borderWidth: 1 },
  footerSecondaryText: { fontWeight: '600' },
  footerPrimary: { borderWidth: 1 },
  footerPrimaryText: { fontWeight: '700' },
  body: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  sectionTitle: { marginTop: 4, marginBottom: 6, fontSize: 15, fontWeight: '600' },
});
