export const StateKeys = {
  // Экраны
  HOME_NOTES: 'homeScreenNotes',
  LAST_EDITED: 'lastEditedNote',

  // Синхронизация
  LAST_SYNC: 'lastSync',
  LAST_IMPORT: 'lastImport',
  LAST_BACKUP: 'lastBackup',

  // Глобальное состояние
  APP_STATE: 'appState',
} as const;

export type StateKey = (typeof StateKeys)[keyof typeof StateKeys];
