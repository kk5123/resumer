import { useMemo, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { generateTriggerTagIdFromLabel, PRESET_TRIGGER_TAGS, TriggerTag } from '@/domain/triggerTag';
import { TriggerTagId } from '@/domain/common.types';

export function TriggerTagPicker() {
  const [customTags, setCustomTags] = useState<TriggerTag[]>([]);
  const [selected, setSelected] = useState<TriggerTagId[]>([]);
  const [input, setInput] = useState('');
  
  const presetIdSet = new Set<TriggerTagId>(PRESET_TRIGGER_TAGS.map((tag) => tag.id));
  const customIdSet = useMemo(() => new Set<TriggerTagId>(customTags.map((tag) => tag.id)), [customTags]);

  const toggle = (tag: TriggerTagId) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAdd = () => {
    const value = input.trim();
    if (!value) return;
    const id = generateTriggerTagIdFromLabel(value);
    if (!presetIdSet.has(id) && !customIdSet.has(id)) {
      setCustomTags((prev) => [...prev, {id: id, label: value}]);
      setSelected((prev) => [...prev, id]);
    }
    setInput('');
    Keyboard.dismiss();
  };

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  return (
    <View style={styles.container}>
      <View style={styles.wrap}>
        {PRESET_TRIGGER_TAGS.map((tag) => {
          const active = selectedSet.has(tag.id);
          return (
            <Pressable
              key={tag.id}
              onPress={() => toggle(tag.id)}
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                pressed && styles.chipPressed,
              ]}
            >
              <Text style={[styles.label, active && styles.labelActive]}>
                {tag.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {customTags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>カスタム</Text>
          <View style={styles.wrap}>
            {customTags.map((tag) => {
              const active = selectedSet.has(tag.id);
              return (
                <Pressable
                  key={tag.id}
                  onPress={() => toggle(tag.id)}
                  style={({ pressed }) => [
                    styles.chip,
                    active && styles.chipActive,
                    pressed && styles.chipPressed,
                  ]}
                >
                  <Text style={[styles.label, active && styles.labelActive]}>
                    {tag.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

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
  section: { gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#4a5568' },
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
