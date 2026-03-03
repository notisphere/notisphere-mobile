// Core components
import { View, Text, StyleSheet } from 'react-native';

// Theme
import { useColors } from '@/src/theme/useColors';

// Hooks
import { useMemo } from 'react';

/** Экран с погодой */
export const WeatherScreen = () => {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Погода (заглушка)</Text>
      <Text>Потом подключим API и геолокацию.</Text>
    </View>
  );
};

/** Стили */
const makeStyles = (c: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: c.surface,
      padding: 14,
    },
    title: { fontSize: 20, fontWeight: '800', color: c.text },
    muted: { color: c.textMuted },
  });
