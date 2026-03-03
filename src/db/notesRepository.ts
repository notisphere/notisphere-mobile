// Database
import { getDatabase } from './database';

// Types
import { Note } from '@/src/types/note';
import { NoteRow } from '@/src/db/types';

// Реаозиторий для работы с заметками

/**
 * Сохраняет заметку в БД
 * @returns ID сохраненной заметки
 */
export const saveNote = async (note: Note): Promise<number> => {
  const db = await getDatabase();

  const timestamp = Date.now();
  const idToSave = note.id && note.id > 0 ? note.id : null;

  const result = await db.runAsync(
    `INSERT OR REPLACE INTO notes (id, title, text, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
    [idToSave, note.title, note.text ?? null, note.createdAt.getTime(), timestamp],
  );

  return (result.lastInsertRowId as number) || note.id!;
};

/**
 * Получает все заметки из БД
 */
export const getAllNotes = async (): Promise<Note[]> => {
  const db = await getDatabase();

  const rows = await db.getAllAsync<NoteRow>(`SELECT * FROM notes ORDER BY updatedAt DESC`);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    text: row.text ?? undefined,
    createdAt: new Date(row.createdAt),
    attachment: { photo: false, audio: false, location: false },
  })) as Note[];
};

/**
 * Получает заметку по ID
 */
export const getNoteById = async (noteId: number): Promise<Note | null> => {
  const db = await getDatabase();

  const row = await db.getFirstAsync<NoteRow>(`SELECT * FROM notes WHERE id = ?`, [noteId]);

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    text: row.text ?? '',
    createdAt: new Date(row.createdAt),
    attachment: { photo: false, audio: false, location: false },
  };
};

/**
 * Удаляет заметку по ID
 */
export const deleteNote = async (noteId: number): Promise<void> => {
  const db = await getDatabase();

  // Благодаря CASCADE, вложения удалятся автоматически
  await db.runAsync(`DELETE FROM notes WHERE id = ?`, [noteId]);
};

/**
 * Удаляет все заметки
 */
export const deleteAllNotes = async (): Promise<void> => {
  const db = await getDatabase();
  try {
    db.withTransactionSync(() => {
      db.runSync(`DELETE FROM attachments`);
      db.runSync(`DELETE FROM notes`);
    });
  } catch (error) {
    console.error('Ошибка очистки базы:', error);
    throw error;
  }
};
