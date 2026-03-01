// Core components
import { View, Text, StyleSheet } from 'react-native';

export const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Настройки (заглушка)</Text>
      <Text>Синхронизация / напоминания / восстановление состояния — позже.</Text>
    </View>
  );
};

/** Стили */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    padding: 14,
  },
  title: { fontSize: 20, fontWeight: '800' },
});
