// Core, hooks
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Types
import type { AppSettings } from '@/src/db/types';

// State
import { saveAppState } from '@/src/db/managers/stateManager';
import { StateKeys } from '@/src/db/stateKeys';

/** Контекст состояния приложения */
type Context = {
  appSettings: AppSettings;
  setTheme: (theme: AppSettings['theme']) => Promise<void>;
};

/** Контекст состояния приложения */
const AppSettingsContext = createContext<Context | null>(null);

/** Провайдер контекста состояния приложения */
export const AppSettingsProvider = (props: {
  initialSettings: AppSettings;
  children: React.ReactNode;
}) => {
  const { initialSettings, children } = props;
  const [appSettings, setAppSettings] = useState<AppSettings>(initialSettings);

  const setTheme = useCallback(async (theme: AppSettings['theme']) => {
    let next: AppSettings;

    setAppSettings((prev) => {
      next = { ...prev, theme };
      return next;
    });

    await saveAppState(StateKeys.APP_SETTINGS, next!);
  }, []);

  const value = useMemo(() => ({ appSettings, setTheme }), [appSettings, setTheme]);

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
};

/** Получение текущих настроек приложения */
export const useAppSettings = () => {
  const Context = useContext(AppSettingsContext);
  if (!Context) throw new Error('useAppSettings must be used inside AppSettingsProvider');
  return Context;
};
