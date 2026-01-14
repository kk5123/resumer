import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { InterruptionEvent } from '@/domain/interruption';
import { t } from '@/shared/i18n/strings';

type Props = {
  latestOpen: InterruptionEvent & {
    scheduledLocal?: string | null;
    occurredLocal?: string | null;
  };
  highlight: boolean;
  resumeDiff: { text: string; isLate: boolean };
  onResume: () => void;
  onSnooze5: () => void;
  onAbandon: () => void;
};

export function LatestOpenCard({
  latestOpen,
  highlight,
  resumeDiff,
  onResume,
  onSnooze5,
  onAbandon,
}: Props) {
  return (
    <ScrollView style={styles.recentSection}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeader}>{t('home.notice.hasOpen')}</Text>
      </View>
      <View style={[styles.latestCard, highlight && styles.latestCardHighlight]}>
        <View style={styles.rowSpace}>
          <Text style={styles.cardTitle}>
            {t('home.label.scheduled')}: {latestOpen.scheduledLocal}
          </Text>
          <Text style={[styles.labelEmphasis, resumeDiff.isLate && styles.labelLate]}>
            {resumeDiff.text}
          </Text>
        </View>

        <Text style={styles.subLabel}>
          {t('home.label.occurred')}: {latestOpen.occurredLocal ?? t('home.card.title')}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t('history.body.reasonPrefix')}</Text>
          <Text style={styles.metaValue}>{latestOpen.context.reasonText || '-'}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t('history.body.firstStepPrefix')}</Text>
          <Text style={styles.metaValue}>{latestOpen.context.firstStepText || '-'}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primary} onPress={onResume}>
            <Text style={styles.primaryText}>{t('home.button.resume')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={onSnooze5}>
            <Text style={styles.secondaryText}>{t('home.button.snooze5')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.danger} onPress={onAbandon}>
            <Text style={styles.dangerText}>{t('home.button.abandon')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  recentSection: { width: '100%', marginTop: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sectionHeader: { fontSize: 15, fontWeight: '700', color: '#111' },
  latestCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  latestCardHighlight: {
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  rowSpace: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  labelEmphasis: { fontSize: 14, fontWeight: '700', color: '#111' },
  labelLate: { color: '#b91c1c' },
  subLabel: { fontSize: 12, color: '#4b5563', marginBottom: 4 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  metaLabel: { fontSize: 12, color: '#6b7280' },
  metaValue: { flex: 1, fontSize: 13, color: '#111', textAlign: 'right' },
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
});
