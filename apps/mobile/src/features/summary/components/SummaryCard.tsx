import { StyleSheet, Text, View } from 'react-native';

type SummaryProps = {
  dateLabel?: string;            // 例: "今日" / "2026/01/12"
  weekRange?: string;            // 例: "今週" / "2026/01/12-2026/01/18"
  total: number;                 // 中断件数
  resumed: number;               // 再開済
  abandoned: number;             // 終了
  snoozed: number;               // 延長
  frequentTrigger: string;
};

export function SummaryCard({
  dateLabel = '今週',
  weekRange,
  total,
  resumed,
  abandoned,
  snoozed,
  frequentTrigger
}: SummaryProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{dateLabel}のサマリ</Text>
          {weekRange && (
            <Text style={styles.subtitle}>{weekRange}</Text>
          )}
        </View>
      </View>

      <Text style={styles.total}>{total} 件</Text>

      <View style={styles.row}>
        <Text style={styles.label}>再開済</Text>
        <Text style={styles.value}>{resumed}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>終了</Text>
        <Text style={styles.value}>{abandoned}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>延長</Text>
        <Text style={styles.value}>{snoozed}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>最も多いきっかけ</Text>
        <Text style={styles.value}>{frequentTrigger}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 15, fontWeight: '700', color: '#111' },
  subtitle: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 4 },
  link: { fontSize: 12, color: '#2563eb', fontWeight: '700' },
  total: { fontSize: 28, fontWeight: '800', color: '#111' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 12, color: '#6b7280' },
  value: { fontSize: 14, color: '#111', fontWeight: '700' },
});