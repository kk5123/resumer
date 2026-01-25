import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { t } from '@/shared/i18n/strings';

type Props = {
  label?: string;
  subLabel?: string,
  onPress: () => void;
  containerStyle?: ViewStyle;
};

export function InterruptButton({
  label = t('interruptButton.label'),
  subLabel = t('interruptButton.subLabel'),
  onPress,
  containerStyle,
}: Props) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.subLabel}>{subLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    width: '80%',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: '#0d9488',
    borderWidth: 1,
    borderColor: '#0d9488',
    shadowColor: '#0d9488',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    gap: 4,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  label: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  subLabel: {
    color: '#ccfbf1',
    fontSize: 13,
    textAlign: 'center',
  },
});
