// features/tutorial/components/TutorialScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

type Slide = { title: string; body: string };
const slides: Slide[] = [
  { title: '中断を記録', body: '作業を中断するときに記録して、後で再開のリマインドに使えます。' },
  { title: '再開をリマインド', body: '再開時刻を設定して通知を受け取り、集中を取り戻しましょう。' },
  { title: '履歴で振り返り', body: '履歴で中断と再開の流れを確認できます。' },
];

type Props = { visible: boolean; onComplete: () => void };

export function TutorialModal({ visible, onComplete }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>このアプリの使い方</Text>
          <Text style={styles.headerBody}>作業が中断したきっかけを記録して、再開を手助けします。履歴で振り返りができます。</Text>
        </View>
        {slides.map((s, i) => (
          <View key={i} style={styles.slide}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.title}>{s.title}</Text>
              <Text style={styles.body}>{s.body}</Text>
            </View>
          </View>
        ))}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.primary]} onPress={onComplete}>
            <Text style={styles.buttonTextPrimary}>はじめる</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, width, height,
    backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  card: {
    width: Math.min(360, width - 48),
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  header: { gap: 6 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  headerBody: { fontSize: 13, color: '#4b5563' },
  slide: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  badge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#2563eb',
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  body: { fontSize: 14, color: '#444' },
  actions: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end', marginTop: 4 },
  button: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  primary: { backgroundColor: '#2563eb' },
  ghost: { borderWidth: 1, borderColor: '#d1d5db' },
  buttonTextPrimary: { color: '#fff', fontWeight: '700' },
  buttonTextGhost: { color: '#374151', fontWeight: '700' },
});