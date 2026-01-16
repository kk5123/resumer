import React from 'react';
import { ScrollView, View, Text, Switch, Pressable, Alert, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Theme, Language, useSettings } from '@/features/settings'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const navigation = useNavigation();

  const {
    settings,
    loaded,
    setNotificationsEnabled,
    setTheme,
    setLanguage,
  } = useSettings();

  if (!loaded) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator /></View>
      </SafeAreaView>
    );
  }

  const confirmDeleteHistory = () => {
    Alert.alert('履歴データ削除', '履歴をすべて削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除する', style: 'destructive', onPress: () => console.log('TODO: delete history') },
    ]);
  };

  const renderThemeChoice = (value: Theme, label: string) => (
    <ChoiceRow label={label} selected={settings.theme === value} onPress={() => setTheme(value)} />
  );

  const renderLanguageChoice = (value: Language, label: string) => (
    <ChoiceRow label={label} selected={settings.language === value} onPress={() => setLanguage(value)} />
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>設定</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>通知</Text>
        <Row
          label='プッシュ通知を受け取る'
          right={<Switch value={settings.notificationsEnabled} onValueChange={setNotificationsEnabled} />}
        />

        <Text style={styles.sectionTitle}>テーマ</Text>
        {renderThemeChoice('system', 'システム設定に従う')}
        {renderThemeChoice('light', 'ライト')}
        {renderThemeChoice('dark', 'ダーク')}

        <Text style={styles.sectionTitle}>言語</Text>
        {renderLanguageChoice('ja', '日本語')}
        {renderLanguageChoice('en', 'English')}

        <Text style={styles.sectionTitle}>履歴データ管理</Text>
        <Pressable style={styles.button} onPress={confirmDeleteHistory}>
          <Text style={styles.buttonText}>削除</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, right }: { label: string; right: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {right}
    </View>
  );
}

function ChoiceRow({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.choiceDot, selected && styles.choiceDotSelected]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  label: { fontSize: 15, color: '#222' },
  choiceDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#aaa' },
  choiceDotSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  button: { paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  buttonText: { color: '#222', fontSize: 15 },
  danger: { borderColor: '#d00' },
  dangerText: { color: '#d00' },

  disabledRow: { opacity: 0.4 },

  root: { flex: 1, backgroundColor: '#f7f9fc' },
  header: {
    position: 'relative',
    paddingHorizontal: 16,
    paddingBottom: 12,
    minHeight: 56,            // ヘッダー高さを安定させる
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // タイトル中央
    backgroundColor: '#f7f9fc',
  },
  backButton: {
    position: 'absolute',
    left: 16,                 // 左端寄せ
    height: 40,
    width: 40,
    justifyContent: 'center', // アイコン縦中央
    alignItems: 'flex-start', // 左寄せ
    paddingVertical: 0,
    paddingRight: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },
});