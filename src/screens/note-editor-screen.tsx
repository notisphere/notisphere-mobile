// Hooks
import { useState, useEffect, useCallback } from 'react';
// Core components
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  GestureResponderEvent,
  Alert,
} from 'react-native';
// Types
import { NotesStackScreenProps } from '@/src/types/navigation';
import { Note } from '@/src/types/note';
// Database
import { saveNote, getNoteById } from '@/src/db/notesRepository';
import { saveAppState } from '@/src/db/stateManager';

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
  const noteId = mode === 'edit' ? params.noteId : undefined;

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(mode === 'edit');

  // 👇 Храним оригинальные данные заметки для режима редактирования
  const [originalNote, setOriginalNote] = useState<Note | null>(null);

  // 👇 Оборачиваем загрузку в useCallback для стабильной ссылки
  const loadNote = useCallback(async (id: number) => {
    try {
      const note = await getNoteById(id);
      if (note) {
        setOriginalNote(note); // Сохраняем оригинал
        setTitle(note.title);
        // 👇 TextInput не принимает null, используем ?? ''
        setText(note.text ?? '');
      }
    } catch (error) {
      console.error('Ошибка загрузки заметки:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить заметку');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 👇 Инициализация с void для ESLint
  useEffect(() => {
    if (mode === 'edit' && noteId) {
      const onLoad = async () => {
        await loadNote(noteId);
      };
      void onLoad();
    } else {
      // Для новой заметки сразу снимаем лоадер
      setIsLoading(false);
    }
  }, [mode, noteId, loadNote]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Заголовок не может быть пустым');
      return;
    }

    try {
      const noteIdToSave = mode === 'edit' && originalNote?.id ? originalNote.id : 0;

      // 👇 Формируем объект заметки с учётом режима
      const note: Note = {
        // Для новой заметки: undefined (чтобы сработал AUTOINCREMENT)
        // Для редактирования: сохраняем оригинальный ID
        id: noteIdToSave,

        title,
        text,

        // 👇 КРИТИЧНО: При редактировании сохраняем оригинальную дату создания!
        createdAt: mode === 'edit' && originalNote?.createdAt ? originalNote.createdAt : new Date(),

        // 👇 Сохраняем существующие вложения или ставим дефолтные
        attachment: originalNote?.attachment ?? { photo: false, audio: false, location: false },
      };

      const savedId = await saveNote(note);

      await saveAppState('lastEditedNote', {
        id: savedId,
        timestamp: Date.now(),
        mode,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Ошибка сохранения заметки:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить заметку');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

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
        onPress={handleSave}
        style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.saveBtnText}>Сохранить</Text>
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
