// components/HistoryCard.tsx
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { HistoryItem } from '../types';
import { t } from '@/shared/i18n/strings';

type Props = {
  item: HistoryItem;
  isLatest?: boolean;
  onResume?: (id: HistoryItem['id']) => void;
  onSnooze?: (id: HistoryItem['id']) => void;
  onAbandon?: (id: HistoryItem['id']) => void;
};

export function HistoryCard({
  item,
  isLatest = false,
  onResume,
  onSnooze,
  onAbandon,
}: Props) {
  const { statusLabel, statusStyle } = (() => {
    switch (item.resumeStatus) {
      case 'resumed':
        return { statusLabel: t('history.status.resumed'), statusStyle: styles.badgeSuccess };
      case 'snoozed':
        return { statusLabel: t('history.status.onbreak'), statusStyle: styles.badgeOnBreak };
      case 'abandoned':
        return { statusLabel: t('history.status.abandoned'), statusStyle: styles.badgeAbandoned };
      default:
        return { statusLabel: t('history.status.onbreak'), statusStyle: styles.badgeOnBreak };
    }
  })();

  const isClosable = item.resumeStatus !== 'abandoned' && item.resumeStatus !== 'resumed';
  const triggerTags = item.context.triggerTagIds ?? [];

  return (
    <View style={[
      styles.card,
      item.resumeStatus === 'resumed' && styles.cardDone,
      item.resumeStatus === 'snoozed' && styles.cardSnooze,
    ]}>
      <View style={styles.rowSpace}>
        <Text style={styles.title}>{item.occurredLocal}</Text>
        <Text style={[styles.badge, statusStyle]}>{statusLabel}</Text>
      </View>

      <Text style={styles.meta}>
        {t('history.body.reasonPrefix')}: {item.context.reasonText || '-'}
      </Text>
      <Text style={styles.meta}>
        {t('history.body.firstStepPrefix')}: {item.context.firstStepText || '-'}
      </Text>
      <Text style={styles.meta}>
        {t('history.body.returnAfterPrefix')}: {item.context.returnAfterMinutes ?? '-'} 分
      </Text>
      {item.scheduledLocal && (
        <Text style={styles.meta}>
          {t('history.body.scheduledPrefix')}: {item.scheduledLocal}
        </Text>
      )}
      {triggerTags.length > 0 ? (
        <View style={styles.tagRow}>
          {triggerTags.map((tag) => (
            <View key={tag} style={styles.chip}>
              <Text style={styles.chipText}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.meta, styles.tagEmpty]}>{t('history.tag.none')}</Text>
      )}

      {isLatest && isClosable && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primary} onPress={() => onResume?.(item.id)}>
            <Text style={styles.primaryText}>{t('home.button.resume')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={() => onSnooze?.(item.id)}>
            <Text style={styles.secondaryText}>{t('home.button.snooze5')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.danger} onPress={() => onAbandon?.(item.id)}>
            <Text style={styles.dangerText}>{t('home.button.abandon')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // 既存のスタイルをそのまま流用
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', gap: 6 },
  cardDone: { backgroundColor: '#f7fff9', borderColor: '#bbf7d0' },
  cardSnooze: { backgroundColor: '#fffdf3', borderColor: '#fef3c7' },
  rowSpace: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 15, fontWeight: '700', color: '#111' },
  badge: { fontSize: 10, color: '#1f2937', backgroundColor: '#e5e7eb', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeSuccess: { backgroundColor: '#dcfce7', color: '#15803d' },
  badgeOnBreak: { backgroundColor: '#fef9c3', color: '#92400e' },
  badgeAbandoned: { backgroundColor: '#fee2e2', color: '#b91c1c' },
  meta: { fontSize: 12, color: '#6b7280' },
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
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  primary: { flex: 1, backgroundColor: '#2563eb', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondary: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  secondaryText: { color: '#374151', fontWeight: '700' },
  danger: { flex: 1, borderWidth: 1, borderColor: '#fca5a5', backgroundColor: '#fef2f2', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  dangerText: { color: '#b91c1c', fontWeight: '700' },
});