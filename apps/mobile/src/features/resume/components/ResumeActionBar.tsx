import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { t } from '@/shared/i18n/strings';

type Props = {
  showSnooze: boolean;
  onResume: () => void;
  onSnooze: () => void;
  onAbandon: () => void;
};

export function ResumeActionBar({ onResume, onSnooze, onAbandon, showSnooze }: Props) {
  return (
    <View style={styles.actions}>
      <TouchableOpacity style={styles.primary} onPress={onResume}>
        <Text style={styles.primaryText}>{t('home.button.resume')}</Text>
      </TouchableOpacity>
      {showSnooze && (
        <TouchableOpacity style={styles.secondary} onPress={onSnooze}>
          <Text style={styles.secondaryText}>{t('home.button.snooze5')}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.danger} onPress={onAbandon}>
        <Text style={styles.dangerText}>{t('home.button.abandon')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
