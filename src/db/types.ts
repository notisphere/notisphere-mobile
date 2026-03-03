/**
 * Настройки приложения (хранятся под ключом 'appState')
 * @note Переименовано из AppState для избежания конфликтов
 */
export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: 'ru' | 'en';
  lastSync?: string;
  deviceId?: string;
}

/**
 * Локальный кэш экрана (НЕ экспортируется, только для этого устройства)
 */
export type ScreenCache = {
  homeScreenNotes?: {
    count: number;
    timestamp: number;
  };
  lastEditedNote?: {
    id: number;
    timestamp: number;
    mode: 'create' | 'edit' | 'view';
  };
};

/**
 * "Сырая" строка из таблицы notes (для внутреннего использования в репозиториях)
 */
export interface NoteRow {
  id: number;
  title: string;
  text: string | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * Результат синхронизации
 */
export interface SyncResult {
  success: boolean;
  timestamp: number;
  notesCreated: number;
  notesUpdated: number;
  notesDeleted: number;
  errors: string[];
}

/**
 * Структура данных для экспорта/импорта
 */
export interface ExportedData {
  version: string;
  exportedAt: string; // ISO string
  notes: {
    id: number;
    title: string;
    text: string;
    createdAt: string | number; // Поддерживаем и ISO, и timestamp
    updatedAt?: string | number;
    attachment?: {
      photo: boolean;
      audio: boolean;
      location: boolean;
    };
  }[];
  appSettings?: AppSettings;
  lastSync?: string;
}
