// Settings
import { useAppSettings } from '@/src/theme/AppSettingsContext';

// Colors
import { colorsByTheme } from './colors';

/** Получение цветовой палитры в зависимости от выбранной темы приложения */
export const useColors = () => {
  const { appSettings } = useAppSettings();
  return colorsByTheme[appSettings.theme];
};
