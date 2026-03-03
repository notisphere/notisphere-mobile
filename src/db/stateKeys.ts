export const StateKeys = {
  // Глобальные настройки
  APP_SETTINGS: 'appSettings',
  LAST_SYNC: 'lastSync',

  // Локальный кэш экранов (НЕ экспортируется)
  HOME_NOTES_CACHE: 'homeScreenNotes',
  LAST_EDITED_CACHE: 'lastEditedNote',

  // Резервные копии
  LAST_BACKUP: 'lastBackup',
  LAST_IMPORT: 'lastImport',
} as const;

export type StateKey = (typeof StateKeys)[keyof typeof StateKeys];

/** Хелпер: какие ключи экспортировать */
export const EXPORTABLE_KEYS: StateKey[] = [StateKeys.APP_SETTINGS, StateKeys.LAST_SYNC];

/** Хелпер: какие ключи только локальные */
export const LOCAL_CACHE_KEYS: StateKey[] = [
  StateKeys.HOME_NOTES_CACHE,
  StateKeys.LAST_EDITED_CACHE,
];
