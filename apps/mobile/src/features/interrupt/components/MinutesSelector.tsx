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
      <View style={[styles.row, { alignItems: 'center', justifyContent: 'space-between' }]}>
        <View style={styles.minutesBox}>
          <Text style={styles.minutesValue}>{value ?? t('interruptModal.minites.undecided')}</Text>
          <Text style={styles.minutesLabel}>{value != null ? t('interruptModal.unit.minute') : ''}</Text>
        </View>

        <View style={styles.stepperContainer}>
          <Pressable onPress={handleDec} style={styles.stepperButton}>
            <Text style={styles.stepperText}>-</Text>
          </Pressable>
          <Pressable onPress={handleInc} style={styles.stepperButton}>
            <Text style={styles.stepperText}>+</Text>
          </Pressable>
        </View>
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
  row: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  minutesBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    flex: 1,
  },
  minutesValue: { 
    fontSize: 24, 
    fontWeight: '700',
    color: '#111',
  },
  minutesLabel: { 
    marginLeft: 4, 
    fontSize: 13, 
    color: '#6b7280',
  },
  stepperContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  stepperButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    width: 48,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  stepperText: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#374151',
  },
  quickRow: { 
    flexDirection: 'row', 
    gap: 6, 
    marginTop: 10, 
    flexWrap: 'wrap' 
  },
  quickButton: { 
    borderWidth: 1, 
    borderColor: '#d1d5db',
    borderRadius: 999, 
    paddingHorizontal: 10, 
    paddingVertical: 6,
    backgroundColor: '#ffffff',
  },
  quickButtonText: { 
    fontSize: 13, 
    fontWeight: '600',
    color: '#374151',
  },
});