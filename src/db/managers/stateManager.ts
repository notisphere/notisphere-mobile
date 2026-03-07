// Database
import { getDatabase } from '../database';

/** Интерфейс для сырой строки из таблицы app_state */
interface AppStateRow {
  value: string; // В БД храним как JSON-строку
}

/**
 * Сохраняет состояние приложения в БД
 */
export const saveAppState = async (key: string, value: any): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.runAsync(`INSERT OR REPLACE INTO app_state (key, value, updatedAt) VALUES (?, ?, ?)`, [
      key,
      JSON.stringify(value),
      Date.now(),
    ]);
  } catch (error) {
    console.error(`Ошибка сохранения состояния '${key}':`, error);
    throw error;
  }
};

/**
 * Получает состояние приложения из БД по ключу
 * @returns Распарсенное значение или null, если не найдено / ошибка парсинга
 */
export const getAppState = async <T = any>(key: string): Promise<T | null> => {
  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync<AppStateRow>(`SELECT value FROM app_state WHERE key = ?`, [
      key,
    ]);

    if (!row?.value) return null;

    try {
      return JSON.parse(row.value) as T;
    } catch (parseError) {
      console.warn(`Ошибка парсинга JSON для ключа '${key}':`, parseError);
      return null;
    }
  } catch (error) {
    console.error(`Ошибка получения состояния '${key}':`, error);
    throw error;
  }
};

/**
 * Удаляет состояние приложения из БД по ключу
 */
export const deleteAppState = async (key: string): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM app_state WHERE key = ?`, [key]);
  } catch (error) {
    console.error(`Ошибка удаления состояния '${key}':`, error);
    throw error;
  }
};

/**
 * Очищает все состояние приложения
 */
export const clearAllAppState = async (): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM app_state`);
  } catch (error) {
    console.error('Ошибка очистки всех состояний:', error);
    throw error;
  }
};
