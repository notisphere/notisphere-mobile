// Core components
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';

// Views
import { SafeAreaView } from 'react-native-safe-area-context';

// Hooks
import { useMemo } from 'react';

// Settings
import { useAppSettings } from '@/src/theme/AppSettingsContext';

// Theme
import { useColors } from '@/src/theme/useColors';

// Firebase
import { auth } from '@/src/firebase';
import { logout } from '@/src/firebase/auth';

/** Экран настроек приложения */
export const SettingsScreen = () => {
  const { appSettings, setTheme } = useAppSettings();

  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  const isLight = appSettings.theme === 'light';
  const isDark = appSettings.theme === 'dark';

  const currentEmail = auth.currentUser?.email ?? 'Нет данных';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error: any) {
      Alert.alert('Ошибка', error.message ?? 'Не удалось выйти из аккаунта');
    }
  };

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

        <View style={styles.card}>
          <Text style={styles.rowTitle}>Аккаунт</Text>

          <Text style={styles.label}>Текущая почта</Text>
          <Text style={styles.value}>{currentEmail}</Text>

          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.primaryBtnText}>Выйти из аккаунта</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (c: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    container: {
      flex: 1,
      padding: 14,
      gap: 12,
      backgroundColor: c.surface,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      marginBottom: 4,
      color: c.text,
    },
    card: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      padding: 12,
      backgroundColor: c.surface,
    },
    cardDanger: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      padding: 12,
      backgroundColor: c.surface,
    },
    rowTitle: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 10,
      color: c.text,
    },
    row: {
      flexDirection: 'row',
      gap: 10,
    },
    btn: {
      flex: 1,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: c.bg,
    },
    btnActive: {
      borderColor: c.text,
    },
    btnText: {
      fontWeight: '700',
      color: c.textMuted,
    },
    btnTextActive: {
      fontWeight: '900',
      color: c.text,
    },
    hint: {
      marginTop: 10,
      color: c.textMuted,
    },
    label: {
      marginBottom: 6,
      color: c.textMuted,
    },
    value: {
      marginBottom: 12,
      color: c.text,
      fontWeight: '600',
    },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      color: c.text,
      backgroundColor: c.bg,
    },
    primaryBtn: {
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      backgroundColor: c.text,
    },
    primaryBtnText: {
      color: c.bg,
      fontWeight: '700',
    },
    dangerBtn: {
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      backgroundColor: c.text,
    },
    dangerBtnText: {
      color: c.bg,
      fontWeight: '700',
    },
    disabledBtn: {
      opacity: 0.6,
    },
  });
