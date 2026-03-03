import { Colors, ThemeMode } from '@/src/types/colors';

export const colorsByTheme: Record<ThemeMode, Colors> = {
  light: {
    bg: '#F6F6F6',
    surface: '#FFFFFF',
    text: '#111111',
    textMuted: '#555555',
    border: '#DDDDDD',

    primary: '#007AFF',
    primaryBg: '#E6F2FF',

    success: '#2E7D32',
    successBg: '#E8F5E9',

    danger: '#FF3B30',
    dangerBg: '#FFE5E5',
  },
  dark: {
    bg: '#0B0B0D',
    surface: '#151518',
    text: '#F5F5F7',
    textMuted: '#A1A1AA',
    border: '#2A2A2E',

    primary: '#4DA3FF',
    primaryBg: '#0F2236',

    success: '#6EE07A',
    successBg: '#102416',

    danger: '#FF6B64',
    dangerBg: '#2A1111',
  },
};
