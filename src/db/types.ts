import * as SQLite from 'expo-sqlite';

/**
 * ========================
 *  Domain Models (Приложение)
 * ========================
 */

/**
 * Настройки приложения (хранятся под ключом 'appState')
 * @note Переименовано из AppState для избежания конфликтов
 */
export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: 'ru' | 'en';
  lastSync?: string; // ISO date string
  deviceId?: string;
}

/**
 * Состояние заметки при редактировании (UI state)
 */
export interface EditNoteState {
  noteId?: number; // Может не быть для новой заметки
  title: string;
  text: string;
  editedAt: number; // timestamp
}

/**
 * Состояние экрана со списком заметок (UI state)
 */
export interface HomeScreenState {
  scrollPosition: number;
  selectedFilter: 'all' | 'recent' | 'favorites';
  lastRefresh: number; // timestamp
}

/**
 * ========================
 *  Database Layer (БД)
 * ========================
 */

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
 * "Сырая" строка из таблицы app_state
 */
export interface AppStateRow {
  id: number;
  key: string;
  value: string; // JSON string
  updatedAt: number | null;
}

/**
 * История операций с БД (для логирования/отладки)
 */
export interface DBOperation {
  type: 'create' | 'update' | 'delete';
  table: 'notes' | 'attachments' | 'app_state';
  entityId: number | string;
  timestamp: number;
  data?: unknown; // Лучше unknown, чем any
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
 * Конфиг для миграции БД (Sync API version)
 */
export interface MigrationConfig {
  version: number;
  name: string;
  // Используем SQLiteDatabase из expo-sqlite и void (синхронно)
  migration: (db: SQLite.SQLiteDatabase) => void;
}

/**
 * ========================
 *  Import/Export
 * ========================
 */

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
  appState?: AppSettings;
  lastSync?: string;
}
