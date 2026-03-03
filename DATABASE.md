# База данных SQLite - Документация

## Структура БД

Приложение использует SQLite с тремя таблицами:

### 1. Таблица `notes` (заметки)
```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  text TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
)
```

**Поля:**
- `id` - уникальный идентификатор заметки
- `title` - название заметки
- `text` - содержимое заметки
- `createdAt` - timestamp создания (миллисекунды)
- `updatedAt` - timestamp последнего обновления (миллисекунды)

### 2. Таблица `attachments` (вложения)
```sql
CREATE TABLE attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  noteId INTEGER NOT NULL,
  photo INTEGER DEFAULT 0,
  audio INTEGER DEFAULT 0,
  location INTEGER DEFAULT 0,
  FOREIGN KEY(noteId) REFERENCES notes(id) ON DELETE CASCADE
)
```

**Поля:**
- `id` - уникальный идентификатор вложения
- `noteId` - ID заметки (внешний ключ)
- `photo` - есть ли фото (0/1)
- `audio` - есть ли аудио (0/1)
- `location` - есть ли геопозиция (0/1)

### 3. Таблица `app_state` (состояние приложения)
```sql
CREATE TABLE app_state (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE,
  value TEXT,
  updatedAt INTEGER
)
```

**Поля:**
- `id` - уникальный идентификатор
- `key` - ключ состояния (уникальный)
- `value` - значение состояния (JSON)
- `updatedAt` - timestamp обновления

## API функций

### Функции управления заметками (`notesRepository.ts`)

```typescript
// Сохраняет заметку (создание или обновление)
saveNote(note: Note): Promise<number>

// Получает все заметки из БД
getAllNotes(): Promise<Note[]>

// Получает заметку по ID
getNoteById(noteId: number): Promise<Note | null>

// Удаляет заметку по ID
deleteNote(noteId: number): Promise<void>

// Удаляет все заметки
deleteAllNotes(): Promise<void>
```

### Функции управления состоянием (`stateManager.ts`)

```typescript
// Сохраняет состояние в БД
saveAppState(key: string, value: any): Promise<void>

// Получает состояние из БД
getAppState(key: string): Promise<any>

// Удаляет состояние по ключу
deleteAppState(key: string): Promise<void>

// Очищает все состояние
clearAllAppState(): Promise<void>
```

## Инициализация при запуске

При запуске приложения происходит:

1. **Инициализация БД** - создание таблиц
2. **Seeding** - автоматическое заполнение БД примерами (только при первом запуске)
3. **Восстановление состояния** - загрузка сохраненного состояния из БД
4. **Загрузка заметок** - получение всех заметок из БД

Это реализовано в хуке `useAppInitialization()` в файле `src/db/useAppInitialization.ts`.

## Сохранение состояния при OnStart

При запуске приложения автоматически:
- Восстанавливаются все сохраненные заметки
- Загружается последнее сохраненное состояние приложения
- Обновляется время последней синхронизации

Пример сохраненного состояния:
```json
{
  "appState": { "theme": "light", "notifications": true },
  "lastSync": "2026-03-01T12:34:56.000Z",
  "homeScreenNotes": { "count": 5, "timestamp": 1740823496000 },
  "lastEditedNote": { "id": 1, "timestamp": 1740823496000 }
}
```

## Синхронизация между устройствами

Текущая реализация сохраняет состояние локально на устройстве. Для синхронизации между устройствами рекомендуется:

1. Добавить API сервер для облачной синхронизации
2. Реализовать функции `uploadState()` и `downloadState()`
3. Использовать облачное хранилище (Firebase, AWS, etc.)

## Примеры использования

### Загрузка всех заметок
```typescript
import { getAllNotes } from '@/src/db/notesRepository';

const notes = await getAllNotes();
console.log('Заметки:', notes);
```

### Сохранение новой заметки
```typescript
import { saveNote } from '@/src/db/notesRepository';
import { Note } from '@/src/types/note';

const newNote: Note = {
  id: 0,
  title: 'Моя заметка',
  text: 'Содержимое заметки',
  createdAt: new Date(),
  attachment: { photo: false, audio: false, location: false }
};

await saveNote(newNote);
```

### Сохранение состояния
```typescript
import { saveAppState, getAppState } from '@/src/db/stateManager';

// Сохранить состояние
await saveAppState('myState', { counter: 42, theme: 'dark' });

// Получить состояние
const state = await getAppState('myState');
console.log(state); // { counter: 42, theme: 'dark' }
```

## Требования

- `expo-sqlite` - для работы с SQLite базой данных
- React Native или Expo

