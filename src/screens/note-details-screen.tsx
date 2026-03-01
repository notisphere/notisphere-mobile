// Core components
import { View, Text, Pressable, StyleSheet } from 'react-native';
// Components
import { Chip } from '@/src/components/chip';
// Types
import { NotesStackScreenProps } from '@/src/types/navigation';
// Mocks
import { mockNotes } from '@/src/data/mock-notes';

export const NoteDetailsScreen = (props: NotesStackScreenProps<'NoteDetails'>) => {
  const { route, navigation } = props;

  const { noteId } = route.params;
  const note = mockNotes.find((n) => n.id === noteId);

  if (!note) {
    return (
      <View style={styles.container}>
        <Text>Нет данных</Text>
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
        {attachment.photo ? <Chip label="Фото" /> : <Chip label="Фото (нет)" />}
        {attachment.audio ? <Chip label="Аудио" /> : <Chip label="Аудио (нет)" />}
        {attachment.location ? <Chip label="Гео" /> : <Chip label="Гео (нет)" />}
      </View>

      <Pressable
        onPress={() => navigation.navigate('NoteEditor', { mode: 'edit', noteId: note?.id })}
        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.btnText}>Редактировать</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 10 },
  text: { fontSize: 16, lineHeight: 22, color: '#333' },
  sectionTitle: { marginTop: 18, marginBottom: 10, fontSize: 16, fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  btn: {
    marginTop: 22,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222',
    padding: 12,
    alignItems: 'center',
  },
  btnText: { fontWeight: '800' },
});
