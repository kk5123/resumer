import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export type TriggerTag = string;

const PRESET_TAGS: TriggerTag[] = ['SNS', '通知', '空腹', 'その他'];

export function TriggerTagPicker() {
  const [tags, setTags] = useState<TriggerTag[]>(PRESET_TAGS);
  const [selected, setSelected] = useState<TriggerTag[]>([]);
  const [input, setInput] = useState('');

  const toggle = (tag: TriggerTag) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAdd = () => {
    const value = input.trim();
    if (!value) return;
    if (tags.includes(value)) {
      setSelected((prev) => (prev.includes(value) ? prev : [...prev, value]));
    } else {
      setTags((prev) => [...prev, value]);
      setSelected((prev) => [...prev, value]);
    }
    setInput('');
  };

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  return (
    <View style={styles.container}>
      <View style={styles.wrap}>
        {tags.map((tag) => {
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

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="タグを追加"
          style={styles.input}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Pressable onPress={handleAdd} style={styles.addButton} hitSlop={8}>
          <Text style={styles.addButtonText}>追加</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d0d7e2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#2d6cdf',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
