import * as SQLite from 'expo-sqlite';

// 👇 Используем современный Async API
let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('notisphere.db');
  }
  return db;
};

export const initDatabase = async () => {
  const database = await getDatabase();

  try {
    // 👇 Используем withTransactionAsync для атомарности
    await database.withTransactionAsync(async () => {
      // Таблица заметок
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          text TEXT,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL
        );
      `);
      console.log('✓ Таблица notes создана');

      // Таблица вложений
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS attachments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          noteId INTEGER NOT NULL,
          photo INTEGER DEFAULT 0,
          audio INTEGER DEFAULT 0,
          location INTEGER DEFAULT 0,
          FOREIGN KEY(noteId) REFERENCES notes(id) ON DELETE CASCADE
        );
      `);
      console.log('✓ Таблица attachments создана');

      // Таблица состояния приложения
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS app_state (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE,
          value TEXT,
          updatedAt INTEGER
        );
      `);
      console.log('✓ Таблица app_state создана');
    });

    console.log('✓ База данных инициализирована успешно');
  } catch (error) {
    console.error('❌ Ошибка инициализации БД:', error);
    throw error;
  }
};

export default getDatabase;
