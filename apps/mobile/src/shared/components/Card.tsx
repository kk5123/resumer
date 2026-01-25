import { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'default' | 'muted' | 'elevated';
};

export function Card({ children, style, variant = 'default' }: Props) {
  return <View style={[styles.base, variantStyles[variant], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    gap: 8,
  },
});

const variantStyles = StyleSheet.create({
  default: {},
  muted: { backgroundColor: '#f8fafc' },
  elevated: { shadowColor: '#111', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
});
