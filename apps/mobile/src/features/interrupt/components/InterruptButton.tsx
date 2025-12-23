import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

type Props = {
  label?: string;
  subLabel?: string,
  onPress: () => void;
  containerStyle?: ViewStyle;
};

export function InterruptButton({
  label = '少し休む',
  subLabel = '無理せず一息つきましょう',
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
  },
  button: {
    minWidth: 260,
    paddingHorizontal: 28,
    paddingVertical: 26,
    borderRadius: 28,
    backgroundColor: '#e8f2ff', // 淡いブルーで安心感
    borderWidth: 1,
    borderColor: '#b7d3ff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
    gap: 6,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  label: {
    color: '#2d6cdf', // 落ち着いたブルー
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  subLabel: {
    color: '#3c5f91',
    fontSize: 14,
    textAlign: 'center',
  },
});
