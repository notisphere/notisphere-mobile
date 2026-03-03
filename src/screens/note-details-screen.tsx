// Core components
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
// Hooks
import { useEffect, useState, useCallback, useMemo } from 'react';
// Components
import { Chip } from '@/src/components/chip';
// Types
import { NotesStackScreenProps } from '@/src/types/navigation';
import { Note } from '@/src/types/note';
// Database
import { getNoteById, deleteNote } from '@/src/db/notesRepository';
import { confirmAction } from '@/src/utils/confirm';
import { useColors } from '@/src/theme/useColors';

export const NoteDetailsScreen = (props: NotesStackScreenProps<'NoteDetails'>) => {
  const { route, navigation } = props;
  const { noteId } = route.params;

  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Оборачиваем загрузку в useCallback для стабильной ссылки
  const loadNote = useCallback(async () => {
    try {
      const dbNote = await getNoteById(noteId);
      setNote(dbNote);
    } catch (error) {
      console.error('Ошибка загрузки заметки:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить заметку');
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    const onLoad = async () => {
      await loadNote();
    };
    void onLoad();
  }, [loadNote]);

  const handleDelete = async () => {
    confirmAction('Удаление', 'Вы уверены, что хотите удалить эту заметку?', async () => {
      try {
        await deleteNote(noteId);
        navigation.goBack();
      } catch (error) {
        console.error('Ошибка удаления заметки:', error);
        alert('Не удалось удалить заметку');
      }
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.container}>
        <Text>Заметка не найдена</Text>
      </View>
    );
  }

  const { title, text, attachment } = note;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title || 'Без названия'}</Text>
      <Text style={styles.text}>{text || '—'}</Text>

      <Text style={styles.sectionTitle}>Вложения</Text>
      <View style={styles.row}>
        <Chip label={attachment?.photo ? 'Фото' : 'Фото (нет)'} />
        <Chip label={attachment?.audio ? 'Аудио' : 'Аудио (нет)'} />
        <Chip label={attachment?.location ? 'Гео' : 'Гео (нет)'} />
      </View>

      <Pressable
        onPress={() => navigation.navigate('NoteEditor', { mode: 'edit', noteId: note.id! })}
        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.btnText}>Редактировать</Text>
      </Pressable>

      <Pressable
        onPress={handleDelete}
        style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.deleteBtnText}>Удалить</Text>
      </Pressable>
    </View>
  );
};

const makeStyles = (c: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, padding: 14, backgroundColor: c.surface },
    title: { fontSize: 22, fontWeight: '800', marginBottom: 10, color: c.text },
    text: { fontSize: 16, lineHeight: 22, color: c.textMuted },
    muted: { color: c.textMuted },
    sectionTitle: {
      marginTop: 18,
      marginBottom: 10,
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
    },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    btn: {
      marginTop: 22,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.text,
      padding: 12,
      alignItems: 'center',
      backgroundColor: c.surface,
    },
    btnText: { fontWeight: '800', color: c.text },
    deleteBtn: {
      marginTop: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.danger,
      padding: 12,
      alignItems: 'center',
      backgroundColor: c.dangerBg,
    },
    deleteBtnText: { fontWeight: '800', color: c.danger },
  });
