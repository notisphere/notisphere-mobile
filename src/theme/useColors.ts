import { useAppSettings } from '@/src/theme/AppSettingsContext';
import { colorsByTheme } from './colors';

export const useColors = () => {
  const { appSettings } = useAppSettings();
  return colorsByTheme[appSettings.theme];
};
