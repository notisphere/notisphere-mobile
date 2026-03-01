// Hooks
import { useState } from 'react';
// Core components
import { View, Text, TextInput, Pressable, StyleSheet, GestureResponderEvent } from 'react-native';
// Types
import { NotesStackScreenProps } from '@/src/types/navigation';
// Mocks
import { mockNotes } from '@/src/data/mock-notes';

function ActionBtn(props: { label: string; onPress: (event: GestureResponderEvent) => void }) {
  const { label, onPress } = props;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
    >
      <Text style={styles.actionBtnText}>{label}</Text>
    </Pressable>
  );
}

export const NoteEditorScreen = (props: NotesStackScreenProps<'NoteEditor'>) => {
  const { route, navigation } = props;

  const params = route.params;
  const mode = params.mode;
  const note = mode === 'edit' ? mockNotes.find((n) => n.id === params.noteId) : undefined;

  const [title, setTitle] = useState(note?.title || '');
  const [text, setText] = useState(note?.text || '');

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>{mode === 'edit' ? 'Редактирование' : 'Новая заметка'}</Text>

      <Text style={styles.label}>Заголовок</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Например: Учёба"
        style={styles.input}
      />

      <Text style={styles.label}>Текст</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Пиши заметку..."
        style={[styles.input, styles.textarea]}
        multiline
      />

      <Text style={styles.label}>Добавить (пока заглушки)</Text>
      <View style={styles.actionsRow}>
        <ActionBtn label="Фото" onPress={() => {}} />
        <ActionBtn label="Аудио" onPress={() => {}} />
        <ActionBtn label="Гео" onPress={() => {}} />
      </View>

      <Pressable
        onPress={() => navigation.goBack()}
        style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.saveBtnText}>Сохранить (пока просто назад)</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: '#fff' },
  h1: { fontSize: 20, fontWeight: '800', marginBottom: 14 },
  label: { marginTop: 12, marginBottom: 6, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
  },
  textarea: { minHeight: 140, textAlignVertical: 'top' },
  actionsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  actionBtn: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  actionBtnText: { fontWeight: '700' },
  saveBtn: {
    marginTop: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222',
    padding: 12,
    alignItems: 'center',
  },
  saveBtnText: { fontWeight: '800' },
});
