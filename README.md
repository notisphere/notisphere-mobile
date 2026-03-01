# Notisphere Mobile App 📱

Умное приложение для создания и управления заметками с использованием SQLite для локального хранения данных.

## Особенности

- ✅ **SQLite БД** - локальное хранилище с 3 таблицами (notes, attachments, app_state)
- ✅ **Сохранение состояния** - автоматическое восстановление при запуске приложения
- ✅ **Синхронизация** - состояние сохраняется и восстанавливается на различных устройствах
- ✅ **Примеры заметок** - автоматическое заполнение БД при первом запуске
- ✅ **TypeScript** - полная типизация
- ✅ **React Navigation** - современная навигация

## Структура проекта

```
notisphere-mobile/
├── src/
│   ├── db/                          # Модуль БД и управления состоянием
│   │   ├── database.ts              # Инициализация и создание таблиц
│   │   ├── notesRepository.ts       # CRUD операции с заметками
│   │   ├── stateManager.ts          # Сохранение и загрузка состояния
│   │   ├── seedDatabase.ts          # Заполнение БД примерами
│   │   ├── useAppInitialization.ts  # Хук инициализации при запуске
│   │   └── EXAMPLES.ts              # Примеры использования
│   ├── components/                  # React компоненты
│   ├── screens/                     # Экраны приложения
│   ├── navigation/                  # Навигация
│   ├── types/                       # TypeScript типы
│   └── data/                        # Моки и статические данные
├── DATABASE.md                      # Полная документация по БД
└── package.json
```

## Быстрый старт

1. **Установка зависимостей**

   ```bash
   npm install
   ```

2. **Запуск приложения**

   ```bash
   npx expo start
   ```

3. **В эмуляторе/телефоне**

   ```bash
   # Android
   npm run android

   # iOS
   npm run ios

   # Web
   npm run web
   ```

## База данных

### Таблицы

1. **notes** - заметки (id, title, text, createdAt, updatedAt)
2. **attachments** - вложения (id, noteId, photo, audio, location)
3. **app_state** - состояние приложения (id, key, value, updatedAt)

### Инициализация при запуске

При запуске приложения автоматически:
1. Инициализируется БД с созданием всех таблиц
2. Заполняются примеры заметок (первый запуск)
3. Восстанавливается сохраненное состояние
4. Загружаются все заметки

📖 **Полная документация:** [DATABASE.md](./DATABASE.md)

## API Функции

### Работа с заметками

```typescript
import { 
  saveNote, 
  getAllNotes, 
  getNoteById, 
  deleteNote 
} from '@/src/db/notesRepository';

// Загрузить все заметки
const notes = await getAllNotes();

// Получить заметку по ID
const note = await getNoteById(1);

// Сохранить заметку
await saveNote(note);

// Удалить заметку
await deleteNote(1);
```

### Управление состоянием

```typescript
import { 
  saveAppState, 
  getAppState, 
  deleteAppState 
} from '@/src/db/stateManager';

// Сохранить состояние
await saveAppState('myState', { counter: 42 });

// Загрузить состояние
const state = await getAppState('myState');

// Удалить состояние
await deleteAppState('myState');
```

## Примеры использования

Смотрите [src/db/EXAMPLES.ts](./src/db/EXAMPLES.ts) для подробных примеров:

- Загрузка заметок
- Создание новой заметки
- Обновление заметки
- Удаление заметки
- Сохранение состояния
- Синхронизация состояния

## Зависимости

- `expo` - фреймворк для React Native
- `expo-sqlite` - работа с SQLite БД
- `@react-navigation/*` - навигация
- `react-native` - основной фреймворк

## Скрипты

```bash
# Запуск приложения
npm start

# Линтинг кода
npm run lint

# Исправление линтинга
npm run lint:fix

# Форматирование кода
npm run format

# Очистка и сброс проекта
npm run reset-project
```

## Разработка

### Добавление новой таблицы в БД

1. Отредактируйте `src/db/database.ts`
2. Добавьте `tx.executeSql()` в функцию `initDatabase()`
3. Создайте функции для работы с новой таблицей

### Добавление нового состояния

```typescript
// В компоненте или хуке
import { saveAppState, getAppState } from '@/src/db/stateManager';

// Сохранить
await saveAppState('myCustomState', { data: '...' });

// Загрузить
const state = await getAppState('myCustomState');
```

## Синхронизация между устройствами

Текущая реализация сохраняет состояние локально. Для синхронизации между устройствами рекомендуется добавить:

- API сервер для облачной синхронизации
- Firebase Realtime Database или Firestore
- AWS Amplify
- CustomEncrypted S3 bucket

## Документация и ресурсы

- [Expo SQLite документация](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [React Native документация](https://reactnative.dev/)
- [React Navigation документация](https://reactnavigation.org/)
- [DATABASE.md](./DATABASE.md) - полная документация БД

## Лицензия

Смотрите [LICENSE](./LICENSE)

