// Hooks
import { useCallback, useEffect, useRef, useState } from 'react';
// Core components
import {
  Alert,
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
// Types
import { NotesStackScreenProps } from '@/src/types/navigation';
import { Note } from '@/src/types/note';
// Database
import { getNoteById, saveNote } from '@/src/db/notesRepository';
import { getAppState, saveAppState } from '@/src/db/stateManager';
import { StateKeys } from '@/src/db/stateKeys';

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
  const [isRestoring, setIsRestoring] = useState(false);

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
    if ((mode === 'edit' || mode === 'view') && noteId) {
      void loadNote(noteId);
    } else {
      setIsLoading(false);
    }
  }, [mode, noteId, loadNote]);

  // 👇 Восстановление черновика (только для режима create)
  useEffect(() => {
    if (mode !== 'create') return;

    const restoreDraft = async () => {
      const draft = await getAppState(StateKeys.LAST_EDITED_CACHE);

      if (draft?.timestamp && Date.now() - draft.timestamp < 30 * 60_000) {
        const confirmed =
          Platform.OS === 'web' ? window.confirm('Восстановить черновик заметки?') : true;

        if (confirmed) {
          setIsRestoring(true);

          const hasValidId = draft.id !== null && draft.id !== undefined;
          const hasContent = draft.title?.trim() || draft.text?.trim();

          if (hasValidId && draft.id! >= 0) {
            // 👇 Существующая заметка
            navigation.setParams({ mode: 'edit', noteId: draft.id });
            await loadNote(draft.id); // 👈 Явно загружаем
          } else if (hasContent) {
            // 👇 Новая заметка — заполняем поля
            setTitle(draft.title ?? '');
            setText(draft.text ?? '');
          }
          setIsRestoring(false);
        }
        await saveAppState(StateKeys.LAST_EDITED_CACHE, null);
      }
    };

    void restoreDraft();
  }, [mode, navigation, loadNote]); // 👈 Добавь loadNote в зависимости

  const hasSavedDraft = useRef(false);

  useEffect(() => {
    if (mode !== 'create' || isRestoring) return;

    // Сохраняем только один раз, когда пользователь начал печатать
    if ((title.trim() || text.trim()) && !hasSavedDraft.current) {
      hasSavedDraft.current = true;
      void saveAppState(StateKeys.LAST_EDITED_CACHE, {
        id: null,
        title,
        text,
        timestamp: Date.now(),
      });
      console.log('💾 Черновик сохранён (первый ввод)');
    }
  }, [mode, title, text, isRestoring]);

  useEffect(() => {
    return () => {
      // При уходе с экрана сохраняем всегда (на случай если пользователь много печатал)
      if (mode === 'create' && (title.trim() || text.trim())) {
        void saveAppState(StateKeys.LAST_EDITED_CACHE, {
          id: null,
          title,
          text,
          timestamp: Date.now(),
        });
        console.log('💾 Черновик обновлён при размонтировании');
      }
    };
  }, [mode, title, text]);

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

      await saveNote(note);

      await saveAppState(StateKeys.LAST_EDITED_CACHE, null);

      navigation.popToTop();
    } catch (error) {
      console.error('Ошибка сохранения заметки:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить заметку');
    }
  };

  const handleEditPress = () => {
    if (originalNote?.id) {
      navigation.setParams({ mode: 'edit' });
    }
  };

  // 👇 Удаление заметки
  const handleDeletePress = () => {
    if (!originalNote?.id) return;

    const confirmDelete = () => {
      navigation.goBack();
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Удалить эту заметку?');
      if (confirmed) confirmDelete();
    } else {
      Alert.alert('Удалить заметку?', 'Это действие нельзя отменить', [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>
        {isViewMode ? 'Просмотр' : isEditMode ? 'Редактирование' : 'Новая заметка'}
      </Text>

      <Text style={styles.label}>Заголовок</Text>
      <TextInput
        value={title}
        onChangeText={isViewMode ? undefined : setTitle}
        placeholder="Например: Учёба"
        style={styles.input}
        editable={!isViewMode}
      />

      <Text style={styles.label}>Текст</Text>
      <TextInput
        value={text}
        onChangeText={isViewMode ? undefined : setText}
        placeholder="Пиши заметку..."
        style={[styles.input, styles.textarea]}
        multiline
        editable={!isViewMode}
      />

      <Text style={styles.label}>Добавить (пока заглушки)</Text>
      <View style={styles.actionsRow}>
        <ActionBtn label="Фото" onPress={() => {}} />
        <ActionBtn label="Аудио" onPress={() => {}} />
        <ActionBtn label="Гео" onPress={() => {}} />
      </View>

      <View style={styles.footer}>
        {isViewMode ? (
          // Режим просмотра: кнопки "Редактировать" и "Удалить"
          <View style={styles.actionRow}>
            <Pressable
              onPress={handleEditPress}
              style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.editBtnText}>✏️ Редактировать</Text>
            </Pressable>
            <Pressable
              onPress={handleDeletePress}
              style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.deleteBtnText}>🗑️ Удалить</Text>
            </Pressable>
          </View>
        ) : (
          // Режим создания/редактирования: кнопка "Сохранить"
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.saveBtnText}>💾 Сохранить</Text>
          </Pressable>
        )}
      </View>
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
  footer: { marginTop: 20 },
  actionRow: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  editBtn: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#E6F2FF',
  },
  editBtnText: { color: '#007AFF', fontWeight: '700' },
  deleteBtn: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFE5E5',
  },
  deleteBtnText: { color: '#FF3B30', fontWeight: '700' },
  saveBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222',
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
  },
  saveBtnText: { fontWeight: '800', color: '#2E7D32' },
});
