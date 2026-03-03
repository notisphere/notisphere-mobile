// Hooks
import { useCallback, useEffect, useRef, useState } from 'react';

// Database
import { initDatabase } from './database';
import { seedDatabase } from './seedDatabase';

// State
import { getAppState, saveAppState } from './stateManager';
import { StateKeys } from '@/src/db/stateKeys';

// Types
import { AppSettings } from '@/src/db/types';

/** Хук для инициализации приложения */
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

  const initializeApp = useCallback(async () => {
    // Если уже инициализировано — выходим (защита от двойного запуска)
    if (isInitialized) return;

    try {
      if (isMounted.current) setIsLoading(true);

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
        // Здесь можно применить тему/язык (раскомментируй при реализации)
        // if (settings.theme) document.documentElement.setAttribute('data-theme', settings.theme);
      } else {
        // Установка настроек приложения по умолчанию
        const defaultSettings: AppSettings = {
          theme: 'light',
          notifications: true,
          language: 'ru',
          lastSync: undefined,
          deviceId: undefined,
        };

        setAppSettings(defaultSettings);
        await saveAppState(StateKeys.APP_SETTINGS, defaultSettings);
      }

      if (!isMounted.current) return;

      // 5. Сохраняем время последней синхронизации
      await saveAppState('lastSync', new Date().toISOString());
      if (!isMounted.current) return;

      // Успех
      if (isMounted.current) {
        setIsInitialized(true);
      }
    } catch (err) {
      if (!isMounted.current) return;

      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('Ошибка инициализации:', errorMsg);
    } finally {
      // Гарантированно выключаем лоадер, только если компонент примонтирован
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [isInitialized]);

  // Запуск при монтировании
  useEffect(() => {
    // Проверка: если уже инициализировано, не запускаем снова
    if (isInitialized) return;

    const onLoad = async () => {
      await initializeApp();
    };
    void onLoad();
  }, [initializeApp, isInitialized]);

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
