// Hooks
import { useCallback, useEffect, useState } from 'react';
// Core components
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
// Database
import { deleteNote, getAllNotes } from '../db/notesRepository';
// Components
import { NoteCard } from '../components/note-card';
// Types
import { NotesStackScreenProps } from '@/src/types/navigation';
import { Note } from '@/src/types/note';

export const HomeScreen = ({ navigation }: NotesStackScreenProps<'Home'>) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { width } = useWindowDimensions();
  const numColumns = width >= 520 ? 2 : 1;

  // 👇 Загрузка заметок
  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const dbNotes = await getAllNotes();
      setNotes(dbNotes);
    } catch (error) {
      console.error('Ошибка загрузки заметок:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  // Перезагрузка при фокусе экрана
  useEffect(() => {
    return navigation.addListener('focus', () => {
      void loadNotes();
    });
  }, [navigation, loadNotes]);

  // 👇 Открытие заметки для редактирования
  const handleOpenNote = useCallback(
    (note: Note) => {
      navigation.navigate('NoteDetails', {
        noteId: note.id!,
      });
    },
    [navigation],
  );

  // 👇 Удаление заметки с подтверждением
  const handleDeleteNote = useCallback(
    async (noteId: number) => {
      Alert.alert('Удалить заметку?', 'Это действие нельзя отменить', [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(noteId);
              await loadNotes();
            } catch (error) {
              console.error('Ошибка удаления заметки:', error);
              Alert.alert('Ошибка', 'Не удалось удалить заметку');
            }
          },
        },
      ]);
    },
    [loadNotes],
  );

  // 👇 Перезагрузка при фокусе экрана
  useEffect(() => {
    return navigation.addListener('focus', () => {
      void loadNotes();
    });
  }, [navigation, loadNotes]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.h1}>Умный блокнот</Text>
        <Pressable
          onPress={() => navigation.navigate('NoteEditor', { mode: 'create' })}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.addBtnText}>+ Новая</Text>
        </Pressable>
      </View>

      <FlatList
        data={notes}
        numColumns={numColumns}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={numColumns > 1 ? styles.colWrap : undefined}
        renderItem={({ item }) => (
          <View style={[styles.itemWrap, { flex: 1 / numColumns }]}>
            <Pressable
              onPress={() => handleOpenNote(item)}
              onLongPress={() => handleDeleteNote(item.id!)}
            >
              <NoteCard note={item} onPress={() => handleOpenNote(item)} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>Пока нет заметок</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: '#f6f6f6' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  h1: { fontSize: 20, fontWeight: '800' },
  addBtn: {
    borderWidth: 1,
    borderColor: '#222',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  addBtnText: { fontWeight: '700' },
  listContent: { paddingTop: 12, paddingBottom: 24 },
  colWrap: { gap: 12 },
  itemWrap: { flex: 1, paddingBottom: 12, paddingHorizontal: 0 },
  empty: { padding: 24, alignItems: 'center' },
});
