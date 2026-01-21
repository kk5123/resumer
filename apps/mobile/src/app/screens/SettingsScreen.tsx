import React from 'react';
import { ScrollView, View, Text, Switch, Pressable, Alert, StyleSheet, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { Theme, Language, useSettings } from '@/features/settings'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { deleteAllHistoryData } from '@/features/settings';
import { useToast } from '@/shared/components/ToastProvider';
import { FEEDBACK_FORM_URL } from '@/shared/constants/config';
import { Header } from '@/shared/components';

export default function SettingsScreen() {
  const navigation = useNavigation();

  const { showToast } = useToast();

  const {
    settings,
    loaded,
    setNotificationsEnabled,
    setTheme,
    setLanguage,
    setWeekStart,
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
      {
        text: '削除する', style: 'destructive', onPress: async () => {
          await deleteAllHistoryData();
          showToast('履歴データをすべて削除しました', { type: 'success' });
        }
      },
    ]);
  };

  const renderWeekStartChoice = (value: 'monday' | 'sunday', label: string) => (
    <ChoiceRow
      label={label}
      selected={settings.weekStart === value}
      onPress={() => setWeekStart(value)}
    />
  );

  const renderThemeChoice = (value: Theme, label: string) => (
    <ChoiceRow label={label} selected={settings.theme === value} onPress={() => setTheme(value)} />
  );

  const renderLanguageChoice = (value: Language, label: string) => (
    <ChoiceRow label={label} selected={settings.language === value} onPress={() => setLanguage(value)} />
  );

  const handleOpenFeedback = async () => {
    const feedbackUrl = FEEDBACK_FORM_URL;
    const canOpen = await Linking.canOpenURL(feedbackUrl);
    if (canOpen) {
      await Linking.openURL(feedbackUrl);
    } else {
      showToast('フィードバックフォームを開けませんでした', { type: 'error' });
    }
  };


  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <Header title="設定" onLeftPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>通知</Text>
        <Row
          label='プッシュ通知を受け取る'
          right={<Switch value={settings.notificationsEnabled} onValueChange={setNotificationsEnabled} />}
        />

        <Text style={styles.sectionTitle}>週の開始日（サマリの集計期間に影響します）</Text>
        {renderWeekStartChoice('monday', '月曜日')}
        {renderWeekStartChoice('sunday', '日曜日')}

        <Text style={styles.sectionTitle}>テーマ</Text>
        {renderThemeChoice('light', 'ライト')}

        <Text style={styles.sectionTitle}>言語</Text>
        {renderLanguageChoice('ja', '日本語')}

        <Text style={styles.sectionTitle}>フィードバック</Text>
        <Pressable style={styles.row} onPress={handleOpenFeedback}>
          <Text style={styles.label}>フィードバックを送信</Text>
          <Ionicons name='open-outline' size={20} color='#6b7280' />
        </Pressable>

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
});