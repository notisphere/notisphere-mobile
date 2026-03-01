// Hooks
import { useMemo, useState } from 'react';
// Core components
import { View, Text, FlatList, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
// Mocks
import { mockNotes } from '../data/mock-notes';
// Components
import { NoteCard } from '../components/note-card';
// Types
import { NotesStackScreenProps } from '@/src/types/navigation';

export const HomeScreen = ({ navigation }: NotesStackScreenProps<'Home'>) => {
  const [notes] = useState(mockNotes);

  const { width } = useWindowDimensions();
  const numColumns = width >= 520 ? 2 : 1;

  const listKey = useMemo(() => `cols-${numColumns}`, [numColumns]);

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
        key={listKey}
        data={notes}
        numColumns={numColumns}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={numColumns > 1 ? styles.colWrap : null}
        renderItem={({ item }) => (
          <View style={styles.itemWrap}>
            <NoteCard
              note={item}
              onPress={() => navigation.navigate('NoteDetails', { noteId: item.id })}
            />
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
