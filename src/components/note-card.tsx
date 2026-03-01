// Core components
import { View, Text, Pressable, StyleSheet, GestureResponderEvent } from 'react-native';
// Components
import { Badge } from '@/src/components/note-badge';
// Types
import { Note } from '@/src/types/note';

/** Каоточка заметки */
export const NoteCard = (props: {
  note: Note;
  onPress: (event: GestureResponderEvent) => void;
}) => {
  const { note, onPress } = props;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Text style={styles.title} numberOfLines={1}>
        {note.title || 'Без названия'}
      </Text>

      <Text style={styles.text} numberOfLines={3}>
        {note.text || '—'}
      </Text>

      <View style={styles.badgesRow}>
        {note.attachment.photo ? <Badge label="Фото" /> : null}
        {note.attachment.audio ? <Badge label="Аудио" /> : null}
        {note.attachment.location ? <Badge label="Гео" /> : null}
      </View>
    </Pressable>
  );
};

/** Стили */
const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 14,
    padding: 12,
    backgroundColor: 'white',
  },
  pressed: { opacity: 0.7 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  text: { fontSize: 14, color: '#333', marginBottom: 10 },
  badgesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});
