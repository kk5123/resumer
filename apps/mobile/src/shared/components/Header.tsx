import { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Action = { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; hitSlop?: number };
type Props = {
  title?: string;
  titleContent?: ReactNode;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  rightActions?: Action[];
  backgroundColor?: string;
  titleAlign?: 'left' | 'center';
};

export function Header({
  title,
  titleContent,
  leftIcon = 'chevron-back',
  onLeftPress,
  rightActions = [],
  backgroundColor = '#f7f9fc',
  titleAlign = 'center',
}: Props) {
  const needsRightPlaceholder = titleAlign === 'center' && rightActions.length === 0;

  return (
    <View style={[styles.root, { backgroundColor }]}>
      {onLeftPress && (
        <TouchableOpacity style={styles.left} onPress={onLeftPress} hitSlop={10}>
          <Ionicons name={leftIcon} size={22} color="#2563eb" />
        </TouchableOpacity>
      )}

      <View
        style={[
          styles.titleContainer,
          titleAlign === 'center' ? { alignItems: 'center'} : {alignItems: 'flex-start'},
        ]}
      >
        {titleContent ?? <Text style={styles.title}>{title}</Text>}
      </View>

      <View style={styles.right}>
        {rightActions.map((a, i) => (
          <TouchableOpacity key={i} onPress={a.onPress} hitSlop={a.hitSlop ?? 10} style={styles.action}>
            <Ionicons name={a.icon} size={22} color="#1f2937" />
          </TouchableOpacity>
        ))}
        {needsRightPlaceholder && <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { minHeight: 56, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center' },
  left: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  placeholder: { width: 40, height: 40 },
  titleContainer: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  action: { paddingHorizontal: 4 },
});