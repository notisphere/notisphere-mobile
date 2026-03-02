import { useCallback, useEffect, useRef, useState } from 'react';
import { initDatabase } from './database';
import { getAppState, saveAppState } from './stateManager';
import { getAllNotes } from './notesRepository';
import { seedDatabase } from './seedDatabase';
import { AppSettings } from '@/src/db/types';
import { StateKeys } from '@/src/db/stateKeys';

export const useAppInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  // Ref для отслеживания монтирования (защита от updates после unmount)
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // 👇 Оборачиваем в useCallback, чтобы функция была стабильной
  const initializeApp = useCallback(async () => {
    // Если уже инициализировано — выходим (защита от двойного запуска)
    if (isInitialized) return;

    try {
      if (isMounted.current) setIsLoading(true);
      console.log('🔄 Инициализация приложения...');

      // 1. Инициализируем БД
      await initDatabase();
      if (!isMounted.current) return;

      // 2. Заполняем БД примерами при первом запуске
      await seedDatabase();
      if (!isMounted.current) return;

      // 3. Восстанавливаем состояние
      const settings = await getAppState<AppSettings>(StateKeys.APP_SETTINGS);
      if (settings) {
        setAppSettings(settings);
        console.log('🎨 Восстановлены настройки:', settings);
        // 👇 Здесь можно применить тему/язык (раскомментируй при реализации)
        // if (settings.theme) document.documentElement.setAttribute('data-theme', settings.theme);
      } else {
        console.log('🎨 [INIT] Настройки не найдены (первый запуск?)');
      }
      // 4. Загружаем заметки
      const notes = await getAllNotes();
      if (!isMounted.current) return;

      console.log(`📝 Загружено заметок: ${notes.length}`);

      // 5. Сохраняем время последней синхронизации
      await saveAppState('lastSync', new Date().toISOString());
      if (!isMounted.current) return;

      // Успех
      if (isMounted.current) {
        setIsInitialized(true);
        console.log('✅ Приложение инициализировано успешно');
      }
    } catch (err) {
      if (!isMounted.current) return;

      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('❌ Ошибка инициализации:', errorMsg);
    } finally {
      // Гарантированно выключаем лоадер, только если компонент примонтирован
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [isInitialized]); // 👈 Зависимости: только isInitialized

  // Запуск при монтировании
  useEffect(() => {
    // Проверка: если уже инициализировано, не запускаем снова
    if (isInitialized) return;

    const onLoad = async () => {
      await initializeApp();
    };
    void onLoad();
  }, [initializeApp, isInitialized]); // 👈 Зависимости

  // Функция для повторной инициализации
  const retry = useCallback(() => {
    if (!isMounted.current) return;

    // Сбрасываем состояния перед повторной попыткой
    setError(null);
    setIsInitialized(false);
    setIsLoading(true);

    // Запускаем заново
    const onLoad = async () => {
      await initializeApp();
    };
    void onLoad();
  }, [initializeApp]);

  return {
    isInitialized,
    error,
    isLoading,
    retry,
    appSettings,
  };
};
