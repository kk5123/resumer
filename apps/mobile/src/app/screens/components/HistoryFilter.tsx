import React, { useCallback, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { DateRange } from '@/domain/common.types';

type PresetKey = '7d' | '30d' | '90d' | 'all';

type Props = {
  onChange: (range: DateRange) => void;
  defaultPreset?: PresetKey
};

const presets: { key: PresetKey; label: string; getRange: () => DateRange }[] = [
  { key: '7d', label: '直近1週間', getRange: () => rangeDays(6) },
  { key: '30d', label: '直近1か月', getRange: () => rangeDays(29) },
  { key: '90d', label: '直近3か月', getRange: () => rangeDays(89) },
  { key: 'all', label: '全期間', getRange: () => ({ from: undefined, to: undefined }) },
];

function rangeDays(pastDays: number): DateRange {
  const to = endOfToday();
  const from = startOfDay(new Date(Date.now() - pastDays * 24 * 60 * 60 * 1000));
  return { from, to };
}
function startOfDay(d: Date) { const nd = new Date(d); nd.setHours(0,0,0,0); return nd; }
function endOfToday() { const d = new Date(); d.setHours(23,59,59,999); return d; }
function formatDate(d?: Date) { if (!d) return '-'; return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

export function HistoryFilter({ onChange, defaultPreset = '7d' }: Props) {
  const [preset, setPreset] = useState<PresetKey>(defaultPreset);
  const [useCustom, setUseCustom] = useState(false);
  const [range, setRange] = useState<DateRange>(() => {
    const p = presets.find((p) => p.key === defaultPreset) ?? presets[0];
    return p.getRange();
  });
  const [pickerState, setPickerState] = useState<{ mode: 'from' | 'to'; visible: boolean }>({ mode: 'from', visible: false });

  const applyPreset = useCallback((key: PresetKey) => {
    setUseCustom(false);
    setPreset(key);
    const r = presets.find((p) => p.key === key)?.getRange() ?? presets[0].getRange();
    setRange(r);
    onChange(r);
  }, [onChange]);

  const openPicker = useCallback((mode: 'from' | 'to') => {
    setUseCustom(true);
    setPickerState({ mode, visible: true });
  }, []);

  const onPick = useCallback((e: DateTimePickerEvent, date?: Date) => {
    if (e.type === 'dismissed') {
      setPickerState((s) => ({ ...s, visible: false }));
      return;
    }
    const picked = date ?? new Date();
    setRange((prev) => {
      const next: DateRange = { ...prev };
      if (pickerState.mode === 'from') next.from = startOfDay(picked);
      else next.to = endOfDay(picked);
      return next;
    });
    // 選択後は必ず閉じる
    setPickerState((s) => ({ ...s, visible: false }));
  }, [pickerState.mode]);

  const applyCustom = useCallback(() => {
    const normalized: DateRange = {
      from: range.from ? startOfDay(range.from) : undefined,
      to: range.to ? endOfDay(range.to) : undefined,
    };
    setRange(normalized);
    setUseCustom(true);
    onChange(normalized);
  }, [range, onChange]);

  return (
    <View style={styles.root}>
      <View style={styles.presetRow}>
        {presets.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[
              styles.presetBtn,
              preset === p.key && !useCustom ? styles.presetBtnActive : null,
            ]}
            onPress={() => applyPreset(p.key)}
          >
            <Text style={styles.presetText}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.customRow}>
        <Text style={styles.customLabel}>任意期間</Text>
        <View style={styles.customInputs}>
          <TouchableOpacity style={styles.dateBtn} onPress={() => openPicker('from')}>
            <Text style={styles.dateText}>From: {formatDate(range.from)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dateBtn} onPress={() => openPicker('to')}>
            <Text style={styles.dateText}>To: {formatDate(range.to)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={applyCustom}>
            <Text style={styles.applyText}>適用</Text>
          </TouchableOpacity>
        </View>
      </View>

      {pickerState.visible && (
        <DateTimePicker
          value={pickerState.mode === 'from' ? range.from ?? new Date() : range.to ?? new Date()}
          mode='date'
          display='default'
          onChange={onPick}
        />
      )}
    </View>
  );
}

// 日終端を揃える補助
function endOfDay(d: Date) { const nd = new Date(d); nd.setHours(23,59,59,999); return nd; }

const styles = StyleSheet.create({
  root: { gap: 8, paddingHorizontal: 12, paddingTop: 8 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff' },
  presetBtnActive: { borderColor: '#2563eb', backgroundColor: '#e0edff' },
  presetText: { color: '#111', fontSize: 12, fontWeight: '600' },
  customRow: { gap: 6 },
  customLabel: { color: '#4b5563', fontSize: 12, fontWeight: '600' },
  customInputs: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateBtn: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 12, backgroundColor: '#fff' },
  dateText: { fontSize: 12, color: '#111', fontWeight: '600' },
  applyBtn: { paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8, backgroundColor: '#2563eb' },
  applyText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});