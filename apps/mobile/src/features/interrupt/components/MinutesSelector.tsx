import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { t } from '@/shared/i18n/strings';

const QUICK_MINUTES = [5, 10, 30, 60];
const MINUTES_DEFAULT = 10;
const MINUTES_MIN = 1;
const MINUTES_MAX = 240;

type Props = {
  value: number | null;
  onChange: (v: number | null) => void;
};

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

export function MinutesSelector({
  value,
  onChange,
}: Props) {
  const handleDec = () => {
    if (value == null) {
      onChange(MINUTES_DEFAULT);
      return;
    }
    onChange(clampInt(value - 1, MINUTES_MIN, MINUTES_MAX));
  };

  const handleInc = () => {
    if (value == null) {
      onChange(MINUTES_DEFAULT);
      return;
    }
    onChange(clampInt(value + 1, MINUTES_MIN, MINUTES_MAX));
  };

  const handleUndecided = () => onChange(null);

  return (
    <>
      <View style={[styles.row, { alignItems: 'center' }]}>
        <Pressable onPress={handleDec} style={styles.stepperButton}>
          <Text style={styles.stepperText}>-</Text>
        </Pressable>

        <View style={styles.minutesBox}>
          <Text style={styles.minutesValue}>{value ?? t('interruptModal.minites.undecided')}</Text>
          <Text style={styles.minutesLabel}>{value != null ? t('interruptModal.unit.minute') : ''}</Text>
        </View>

        <Pressable onPress={handleInc} style={styles.stepperButton}>
          <Text style={styles.stepperText}>+</Text>
        </Pressable>
      </View>

      <View style={styles.quickRow}>
        <Pressable onPress={handleUndecided} style={styles.quickButton}>
          <Text style={styles.quickButtonText}>{t('interruptModal.minites.undecided')}</Text>
        </Pressable>
        {QUICK_MINUTES.map((m) => (
          <Pressable key={m} onPress={() => onChange(m)} style={styles.quickButton}>
            <Text style={styles.quickButtonText}>{m}</Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
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
    width: 110,
  },
  minutesValue: { fontSize: 28, fontWeight: '700' },
  minutesLabel: { marginLeft: 6, fontSize: 14, opacity: 0.7 },
  quickRow: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  quickButton: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  quickButtonText: { fontWeight: '600' },
});
