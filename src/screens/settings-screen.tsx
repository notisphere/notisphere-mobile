// Core components
import { View, Text, Pressable, StyleSheet } from 'react-native';
// Views
import { SafeAreaView } from 'react-native-safe-area-context';
// Hooks
import { useAppSettings } from '@/src/theme/AppSettingsContext';
import { useColors } from '@/src/theme/useColors';
import { useMemo } from 'react';

/** Экран настроек */
export const SettingsScreen = () => {
  const { appSettings, setTheme } = useAppSettings();

  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  // Выбор текущей темы приложения
  const isLight = appSettings.theme === 'light';
  const isDark = appSettings.theme === 'dark';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <Text style={styles.title}>Настройки</Text>

        <View style={styles.card}>
          <Text style={styles.rowTitle}>Тема</Text>

          <View style={styles.row}>
            <Pressable
              onPress={() => void setTheme('light')}
              style={[styles.btn, isLight && styles.btnActive]}
            >
              <Text style={[styles.btnText, isLight && styles.btnTextActive]}>Светлая</Text>
            </Pressable>

            <Pressable
              onPress={() => void setTheme('dark')}
              style={[styles.btn, isDark && styles.btnActive]}
            >
              <Text style={[styles.btnText, isDark && styles.btnTextActive]}>Тёмная</Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>Тема сохраняется и восстановится при следующем запуске.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (c: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    container: { flex: 1, padding: 14, backgroundColor: c.surface },
    title: { fontSize: 20, fontWeight: '800', marginBottom: 12, color: c.text },
    card: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      padding: 12,
      backgroundColor: c.surface,
    },
    rowTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: c.text },
    row: { flexDirection: 'row', gap: 10 },
    btn: {
      flex: 1,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: c.bg,
    },
    btnActive: { borderColor: c.text },
    btnText: { fontWeight: '700', color: c.textMuted },
    btnTextActive: { fontWeight: '900', color: c.text },
    hint: { marginTop: 10, color: c.textMuted },
  });
