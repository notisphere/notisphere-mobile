import { getAllNotes, saveNote } from './notesRepository';
import { getAppState, saveAppState } from './stateManager';
import { AppSettings, ExportedData, SyncResult } from './types';
import { Note } from '@/src/types/note';
import { StateKeys } from '@/src/db/stateKeys';

/**
 * Экспортирует все данные приложения для синхронизации
 */
export const exportAppData = async () => {
  try {
    const notes = await getAllNotes();

    const [appSettings, lastSync] = await Promise.all([
      getAppState<AppSettings>(StateKeys.APP_SETTINGS),
      getAppState<string>(StateKeys.LAST_SYNC),
    ]);

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      notes,
      appSettings,
      lastSync,
    };
  } catch (error) {
    console.error('Ошибка экспорта данных:', error);
    throw error;
  }
};

/**
 * Импортирует данные приложения из другого устройства
 */
export const importAppData = async (data: ExportedData) => {
  try {
    console.log('📥 Импортирую данные приложения...');

    // Импортируем заметки
    if (data.notes && Array.isArray(data.notes)) {
      for (const rawNote of data.notes) {
        const noteToSave: Note = {
          id: rawNote.id,
          title: rawNote.title,
          text: rawNote.text,
          createdAt:
            typeof rawNote.createdAt === 'string'
              ? new Date(rawNote.createdAt) // ISO string -> Date
              : new Date(rawNote.createdAt), // timestamp -> Date
          // updatedAt обычно не нужен в Note, т.к. это вычисляемое поле или хранится отдельно
          attachment: rawNote.attachment ?? { photo: false, audio: false, location: false },
        };

        await saveNote(noteToSave);
      }
      console.log(`✓ Импортировано ${data.notes.length} заметок`);
    }

    // Импортируем глобальные настройки
    if (data.appSettings) {
      await saveAppState(StateKeys.APP_SETTINGS, data.appSettings);
      console.log('✓ Настройки приложения импортированы');
    }
    if (data.lastSync) {
      await saveAppState(StateKeys.LAST_SYNC, data.lastSync);
    }

    return { success: true };
  } catch (error) {
    console.error('Ошибка импорта данных:', error);
    throw error;
  }
};

/**
 * Выполняет синхронизацию между устройствами
 * (Заглушка для будущей реализации облачной синхронизации)
 */
export const syncWithCloud = async (): Promise<SyncResult> => {
  const result: SyncResult = {
    success: false,
    timestamp: Date.now(),
    notesCreated: 0,
    notesUpdated: 0,
    notesDeleted: 0,
    errors: ['Облачная синхронизация не реализована'],
  };

  try {
    console.log('🔄 Начинаю синхронизацию с облаком...');

    // TODO: Реализовать облачную синхронизацию
    // 1. Получить данные с сервера
    // 2. Сравнить с локальными данными
    // 3. Загрузить новые/измененные заметки
    // 4. Обновить локальную БД

    console.warn('⚠️  Облачная синхронизация не реализована');
    result.errors = ['Необходимо реализовать синхронизацию с API сервером'];
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.errors.push(errorMsg);
    console.error('❌ Ошибка синхронизации:', error);
    return result;
  }
};

/**
 * Получает дату последней синхронизации
 */
export const getLastSyncTime = async (): Promise<Date | null> => {
  try {
    const lastSync = await getAppState('lastSync');
    if (lastSync) {
      return new Date(lastSync);
    }
    return null;
  } catch (error) {
    console.error('Ошибка получения времени синхронизации:', error);
    return null;
  }
};

/**
 * Проверяет, нужна ли синхронизация
 */
export const shouldSync = async (intervalMs: number = 3600000): Promise<boolean> => {
  try {
    const lastSync = await getLastSyncTime();
    if (!lastSync) return true; // Никогда не синхронизировалась

    const now = Date.now();
    const timeSinceLastSync = now - lastSync.getTime();
    return timeSinceLastSync > intervalMs;
  } catch (error) {
    console.error('Ошибка проверки синхронизации:', error);
    return false;
  }
};

/**
 * Резервная копия БД
 */
export const createBackup = async () => {
  try {
    console.log('💾 Создаю резервную копию...');

    const backup = {
      timestamp: Date.now(),
      isoDate: new Date().toISOString(),
      data: await exportAppData(),
    };

    await saveAppState('lastBackup', backup);
    console.log('✓ Резервная копия создана');

    return backup;
  } catch (error) {
    console.error('Ошибка создания резервной копии:', error);
    throw error;
  }
};

/**
 * Восстановление из резервной копии
 */
export const restoreFromBackup = async () => {
  try {
    console.log('♻️  Восстанавливаю из резервной копии...');

    const backup = await getAppState('lastBackup');
    if (!backup) {
      console.warn('⚠️  Резервная копия не найдена');
      return null;
    }

    await importAppData(backup.data);
    console.log('✓ Восстановление завершено');

    return backup;
  } catch (error) {
    console.error('Ошибка восстановления из резервной копии:', error);
    throw error;
  }
};
