import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type TriggerTag = string;

const PresetTriggerTags: TriggerTag[] =[
  'SNS',
  '通知',
  '空腹',
  'その他'
];

export function TriggerTagPicker() {
  const [selected, setSelected] = useState<TriggerTag[]>([]);

  const toggle = (tag: TriggerTag) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  return (
    <View style={styles.wrap}>
      {PresetTriggerTags.map((tag) => {
        const active = selectedSet.has(tag);
        return (
          <Pressable
            key={tag}
            onPress={() => toggle(tag)}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {tag}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#d0d7e2',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#e8f2ff',
    borderColor: '#2d6cdf',
  },
  chipPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  label: {
    color: '#4a5568',
    fontSize: 14,
    fontWeight: '600',
  },
  labelActive: {
    color: '#1f4fa0',
  },
});