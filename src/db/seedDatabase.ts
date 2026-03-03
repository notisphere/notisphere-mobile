import { getDatabase } from './database';
import { mockNotes } from '@/src/data/mock-notes';

/**
 * Заполняет БД примерами из mock-notes при первом запуске
 */
export const seedDatabase = async (): Promise<void> => {
  const db = await getDatabase();

  try {
    // Проверяем, есть ли уже данные
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM notes`,
      [],
    );

    const count = result?.count ?? 0;

    if (count === 0 && mockNotes.length > 0) {
      // Используем транзакцию для атомарной вставки всех заметок
      await db.withTransactionAsync(async () => {
        for (const note of mockNotes) {
          await db.runAsync(
            `INSERT INTO notes (title, text, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
            [note.title, note.text, note.createdAt.getTime(), Date.now()],
          );
        }
      });
    }
  } catch (error) {
    console.error('Ошибка при заполнении БД:', error);
    throw error;
  }
};
