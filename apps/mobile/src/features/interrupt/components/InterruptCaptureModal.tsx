import { useState, useMemo, useEffect, useRef } from 'react';
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
import { getInterruptPorts } from '../ports';
import { createInterruptionEvent, InterruptionEvent } from '@/domain/interruption';
import { t } from '@/shared/i18n/strings';
import { useToast } from '@/shared/components/ToastProvider';

import { MinutesSelector } from './MinutesSelector';

export type InterruptCaptureModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSave: (e: InterruptionEvent) => void;
};

export type InterruptionDraft = {
  reasonText: string;
  firstStepText: string;
  returnAfterMinutes: number | null;
};

export function InterruptCaptureModal(props: InterruptCaptureModalProps) {
  const { visible, onCancel, onSave } = props;
  const [ready, setReady] = useState(false);
  const [initialCustomTags, setInitialCustomTags] = useState<TriggerTag[]>([]);

  const [occurredAt, setOccurredAt] = useState<string | null>(null);

  const tagPickerRef = useRef<TriggerTagPickerHandle | null>(null);

  const { showToast } = useToast();

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
    return () => {
      mounted = false;
    };
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
    return () => {
      mounted = false;
    };
  }, []);

  const [draft, setDraft] = useState<InterruptionDraft>({
    reasonText: '',
    firstStepText: '',
    returnAfterMinutes: null,
  });

  const handleCancel = () => {
    onCancel();
  };

  const handleSave = async () => {
    if (!occurredAt) return;

    const now = new Date().toISOString();

    const selection = tagPickerRef.current?.getSelection();
    const triggerTagIds = selection?.selectedIds ?? [];
    const selectedCustomTags = selection?.customTags ?? [];

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
          returnAfterMinutes: draft.returnAfterMinutes ?? undefined,
        },
      });

      await interruptionRepo.save(event);
      onSave(event);
    } catch (e) {
      console.error('[InterruptCaptureModal] save error', e);
      showToast(t('toast.save.failed'));
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
            <Pressable onPress={handleCancel} hitSlop={12} style={styles.headerButton}>
              <Text style={styles.headerClose}>キャンセル</Text>
            </Pressable>
            <Text style={styles.headerTitle}>{t('interruptModal.header')}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView 
            style={styles.body} 
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
          >
            {/* きっかけ */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('interruptModal.section.trigger')}</Text>
              <TriggerTagPicker
                ref={tagPickerRef}
                initialCustomTags={initialCustomTags}
              />
            </View>

            {/* 理由メモ */}
            <View style={styles.section}>
              <Text style={styles.label}>{t('interruptModal.caption.reason')}</Text>
              <TextInput
                value={draft.reasonText}
                onChangeText={(tx) => setDraft((d) => ({ ...d, reasonText: tx }))}
                style={styles.input}
                placeholder="例: 集中力が切れた"
                placeholderTextColor="#9ca3af"
                multiline={false}
                returnKeyType="next"
              />
            </View>

            {/* 再開後の初手 */}
            <View style={styles.section}>
              <Text style={styles.label}>{t('interruptModal.caption.firstStep')}</Text>
              <TextInput
                value={draft.firstStepText}
                onChangeText={(tx) => setDraft((d) => ({ ...d, firstStepText: tx }))}
                style={styles.input}
                placeholder="例: メールを確認する"
                placeholderTextColor="#9ca3af"
                multiline={false}
                returnKeyType="next"
              />
            </View>

            {/* 復帰予定時刻 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('interruptModal.section.returnAfter')}</Text>
              <MinutesSelector
                value={draft.returnAfterMinutes}
                onChange={(v) => setDraft((d) => ({ ...d, returnAfterMinutes: v }))}
              />
            </View>
          </ScrollView>

          {/* Footer - 固定表示 */}
          <View style={styles.footer}>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.saveButtonPressed,
              ]}
            >
              <Text style={styles.saveButtonText}>{t('interruptModal.action.save')}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  headerClose: { 
    fontSize: 16, 
    color: '#6b7280',
    fontWeight: '600',
  },
  headerTitle: { 
    textAlign: 'center',
    fontSize: 18, 
    fontWeight: '700', 
    color: '#111',
  },
  headerSpacer: { 
    width: 60,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#111',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#ffffff',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  saveButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});